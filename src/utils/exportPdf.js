import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportToPdf(element, filename = 'report') {
  // Temporarily remove dark mode for light-colored PDF
  const html = document.documentElement;
  const hadDark = html.classList.contains('dark');
  if (hadDark) html.classList.remove('dark');

  // Make element visible for capture
  const prev = {
    position: element.style.position,
    left: element.style.left,
    top: element.style.top,
  };
  element.style.position = 'fixed';
  element.style.left = '0';
  element.style.top = '0';

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const usableWidth = pageWidth - margin * 2;
    const imgWidth = usableWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let yOffset = 0;
    const usableHeight = pageHeight - margin * 2;

    while (yOffset < imgHeight) {
      if (yOffset > 0) pdf.addPage();
      pdf.addImage(
        imgData, 'PNG',
        margin, margin - yOffset,
        imgWidth, imgHeight
      );
      yOffset += usableHeight;
    }

    pdf.save(`${filename}.pdf`);
  } finally {
    // Restore element position
    element.style.position = prev.position;
    element.style.left = prev.left;
    element.style.top = prev.top;
    // Restore dark mode
    if (hadDark) html.classList.add('dark');
  }
}
