import { jsPDF } from "jspdf";

export function generateSimplePdf(title: string, lines: string[]) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 20, 20);
  doc.setFontSize(11);
  lines.forEach((line, index) => {
    doc.text(line, 20, 35 + index * 8);
  });
  return doc.output("arraybuffer");
}
