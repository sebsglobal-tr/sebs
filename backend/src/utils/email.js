import nodemailer from 'nodemailer';

// Email configuration from environment
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sebsglobal@gmail.com',
    pass: 'relg ppmc jtmp jhur' // App password
  }
});

export async function sendVerificationEmail(email, code, firstName) {
  try {
    const mailOptions = {
      from: 'SEBS Global <sebsglobal@gmail.com>',
      to: email,
      subject: 'SEBS Global - E-posta Doğrulama',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { background: #f8fafc; padding: 30px; }
            .code { background: white; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border: 2px solid #667eea; border-radius: 10px; }
            .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>SEBS Global</h1>
            </div>
            <div class="content">
              <h2>Merhaba ${firstName},</h2>
              <p>SEBS Global'e hoş geldiniz! Hesabınızı doğrulamak için aşağıdaki 6 haneli kodu kullanın:</p>
              <div class="code">${code}</div>
              <p>Bu kod 10 dakika süreyle geçerlidir.</p>
              <p>Eğer bu işlemi siz yapmadıysanız, bu e-postayı yok sayabilirsiniz.</p>
            </div>
            <div class="footer">
              <p>© 2025 SEBS Global - Tüm hakları saklıdır.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
}

