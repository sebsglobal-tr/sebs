/**
 * Big Five raporunu PDF olarak indirir (html2pdf.js) veya yazdırma penceresine düşer.
 * @param {string} elementId
 */
export async function downloadBigFivePdf(elementId = 'bf-report-document') {
  const el = document.getElementById(elementId);
  if (!el) return;

  const btn = document.getElementById('btnDownloadPdf');
  const prevLabel = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> PDF hazırlanıyor…';
  }

  try {
    const html2pdf = window.html2pdf;
    if (html2pdf) {
      const date = new Date().toISOString().slice(0, 10);
      await html2pdf()
        .set({
          margin: [8, 8, 8, 8],
          filename:
            elementId === 'ca-report-document'
              ? `sebs-kariyer-degerlendirme-rapor-${date}.pdf`
              : `sebs-big-five-rapor-${date}.pdf`,
          image: { type: 'jpeg', quality: 0.92 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            letterRendering: true,
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        })
        .from(el)
        .save();
    } else {
      window.print();
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = prevLabel;
    }
  }
}

export function printBigFiveReport() {
  window.print();
}
