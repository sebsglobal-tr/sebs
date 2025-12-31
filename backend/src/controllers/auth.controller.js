// Authentication Controller
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { generateULID } from '../utils/ulid.js';
import { sendVerificationEmail } from '../utils/email.js';
import { prisma } from '../server.js';

export async function register(req, res, next) {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Hash password and generate ULID
    const passwordHash = await hashPassword(password);
    const publicId = generateULID();

    // Generate verification code (6 digits)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration time (10 minutes from now)
    const verificationCodeExpires = new Date();
    verificationCodeExpires.setMinutes(verificationCodeExpires.getMinutes() + 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        publicId,
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        isVerified: false,
        verificationCode,
        verificationCodeExpires
      },
      select: {
        id: true,
        publicId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode, firstName);
      console.log('Verification email sent to:', email);
    } catch (error) {
      console.error('Failed to send email:', error);
      // Continue registration even if email fails
    }

    // Generate tokens
    const accessToken = generateAccessToken({ publicId: user.publicId, role: user.role });
    const refreshToken = generateRefreshToken({ publicId: user.publicId });

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt
      }
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Verification code sent to email.',
      data: {
        user,
        verificationCode: verificationCode, // For testing
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Verify password
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is inactive' 
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Get user's current progress from database
    const userProgress = await prisma.moduleProgress.findMany({
      where: { userId: user.id },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                title: true,
                category: true,
                level: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Format progress for response
    const progressSummary = {
      totalModules: userProgress.length,
      completedModules: userProgress.filter(p => p.isCompleted).length,
      inProgressModules: userProgress.filter(p => !p.isCompleted && p.percentComplete > 0).length,
      modules: userProgress.map(p => ({
        moduleId: p.moduleId,
        moduleTitle: p.module.title,
        courseTitle: p.module.course.title,
        percentComplete: p.percentComplete,
        isCompleted: p.isCompleted,
        lastUpdated: p.updatedAt
      }))
    };

    // Generate tokens
    const accessToken = generateAccessToken({ publicId: user.publicId, role: user.role });
    const refreshToken = generateRefreshToken({ publicId: user.publicId });

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt
      }
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          publicId: user.publicId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          accessLevel: user.accessLevel
        },
        tokens: {
          accessToken,
          refreshToken
        },
        progress: progressSummary
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshTokens(req, res, next) {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if token exists in database
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired refresh token' 
      });
    }

    // Check if user is active
    if (!tokenRecord.user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'User account is inactive' 
      });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken({ 
      publicId: decoded.publicId, 
      role: tokenRecord.user.role 
    });
    const newRefreshToken = generateRefreshToken({ publicId: decoded.publicId });

    // Update refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { token: newRefreshToken, expiresAt }
    });

    res.json({
      success: true,
      data: {
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { email, code } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Kullanıcı bulunamadı' 
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'E-posta adresi zaten doğrulanmış' 
      });
    }

    // Check if code is provided
    if (!code || code.length !== 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Geçersiz doğrulama kodu formatı' 
      });
    }

    // Check if user has a verification code
    if (!user.verificationCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Doğrulama kodu bulunamadı. Lütfen yeni bir kod talep edin.' 
      });
    }

    // Check if code has expired
    if (user.verificationCodeExpires && new Date() > user.verificationCodeExpires) {
      return res.status(400).json({ 
        success: false, 
        message: 'Doğrulama kodu süresi dolmuş. Lütfen yeni bir kod talep edin.' 
      });
    }

    // Verify the code matches
    if (user.verificationCode !== code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Doğrulama kodu hatalı. Lütfen e-postanızı kontrol edin.' 
      });
    }

    // Code is valid, update user as verified and clear verification code
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        isVerified: true,
        verificationCode: null,
        verificationCodeExpires: null
      }
    });

    res.json({
      success: true,
      message: 'E-posta adresi başarıyla doğrulandı',
      data: {
        user: {
          publicId: user.publicId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isVerified: true
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;

    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken }
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
}

