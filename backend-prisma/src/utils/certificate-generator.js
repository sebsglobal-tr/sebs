// Certificate Generator
// Generates beautiful HTML/PDF certificates

export async function generateCertificate(certificate, user) {
  // Generate beautiful HTML certificate
  const html = generateCertificateHTML(certificate, user);
  
  // For now, return HTML. Later can convert to PDF using puppeteer
  // Save to public/certificates folder
  const filename = `certificate-${certificate.id}.html`;
  const url = `/certificates/${filename}`;
  
  return url;
}

function generateCertificateHTML(certificate, user) {
  const categoryColors = {
    'siber-guvenlik': {
      primary: '#667eea',
      secondary: '#764ba2',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    'bulut-bilisim': {
      primary: '#3182ce',
      secondary: '#2b6cb0',
      gradient: 'linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%)'
    },
    'veri-bilimi': {
      primary: '#10b981',
      secondary: '#059669',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    }
  };

  const colors = categoryColors[certificate.category] || categoryColors['siber-guvenlik'];
  
  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sertifika - ${certificate.title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      background: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .certificate {
      width: 100%;
      max-width: 900px;
      background: white;
      box-shadow: 0 10px 50px rgba(0,0,0,0.2);
      position: relative;
      overflow: hidden;
    }
    .certificate::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: ${colors.gradient};
      opacity: 0.05;
      transform: rotate(45deg);
    }
    .certificate-header {
      background: ${colors.gradient};
      color: white;
      padding: 40px;
      text-align: center;
      position: relative;
    }
    .certificate-header h1 {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    .certificate-header p {
      font-size: 18px;
      opacity: 0.95;
    }
    .certificate-body {
      padding: 60px 40px;
      text-align: center;
    }
    .certificate-body h2 {
      font-size: 32px;
      color: #1e293b;
      margin-bottom: 30px;
      font-weight: normal;
    }
    .recipient-name {
      font-size: 42px;
      color: ${colors.primary};
      font-weight: bold;
      margin: 20px 0;
      text-decoration: underline;
      text-decoration-color: ${colors.secondary};
      text-decoration-thickness: 3px;
    }
    .certificate-description {
      font-size: 18px;
      color: #64748b;
      line-height: 1.8;
      margin: 30px 0;
    }
    .certificate-details {
      display: flex;
      justify-content: space-around;
      margin-top: 50px;
      padding-top: 30px;
      border-top: 2px solid #e2e8f0;
    }
    .detail-item {
      text-align: center;
    }
    .detail-label {
      font-size: 14px;
      color: #94a3b8;
      margin-bottom: 5px;
    }
    .detail-value {
      font-size: 18px;
      color: ${colors.primary};
      font-weight: bold;
    }
    .certificate-footer {
      padding: 30px 40px;
      background: #f8fafc;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .signature {
      text-align: center;
    }
    .signature-line {
      border-top: 2px solid #1e293b;
      width: 200px;
      margin: 0 auto 10px;
    }
    .certificate-id {
      font-size: 12px;
      color: #94a3b8;
    }
    .decorative-border {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 3px solid ${colors.primary};
      border-radius: 5px;
      opacity: 0.2;
    }
    @media print {
      body {
        background: white;
      }
      .certificate {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="decorative-border"></div>
    <div class="certificate-header">
      <h1>🎓 SERTİFİKA</h1>
      <p>SEBS Global Eğitim Platformu</p>
    </div>
    <div class="certificate-body">
      <h2>Bu Sertifika</h2>
      <div class="recipient-name">
        ${user.firstName} ${user.lastName}
      </div>
      <p class="certificate-description">
        ${certificate.description}
      </p>
      <div class="certificate-details">
        <div class="detail-item">
          <div class="detail-label">Kategori</div>
          <div class="detail-value">${certificate.title}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Tamamlanma Süresi</div>
          <div class="detail-value">${Math.round(certificate.completionTime / 60)} saat</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Tarih</div>
          <div class="detail-value">${new Date(certificate.earnedAt).toLocaleDateString('tr-TR')}</div>
        </div>
      </div>
    </div>
    <div class="certificate-footer">
      <div class="signature">
        <div class="signature-line"></div>
        <p>SEBS Global</p>
      </div>
      <div class="certificate-id">
        ID: ${certificate.id.substring(0, 8)}
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

