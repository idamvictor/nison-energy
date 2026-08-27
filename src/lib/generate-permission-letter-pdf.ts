import { jsPDF } from "jspdf";

const MARGIN = 20;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const PRIMARY: [number, number, number] = [0, 98, 122];
const MUTED: [number, number, number] = [91, 107, 114];
const BODY: [number, number, number] = [30, 41, 46];
const RULE: [number, number, number] = [222, 230, 232];
const FIELD_RULE: [number, number, number] = [180, 190, 194];

export function generatePermissionLetterPdf() {
  const doc = new jsPDF();
  let y = MARGIN;

  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...PRIMARY);
  doc.text("Landlord / Freeholder Permission Letter Template", MARGIN, y);
  y += 9;

  doc.setFont("times", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  const intro = doc.splitTextToSize(
    "Use this template to request written permission to install an EV chargepoint, as required for the OZEV Electric Vehicle Chargepoint Grant for Renters and Flat Owners. Fill in the blanks, sign, and keep a copy for your grant application.",
    CONTENT_WIDTH
  );
  doc.text(intro, MARGIN, y);
  y += intro.length * 4.4 + 6;

  doc.setDrawColor(...RULE);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 9;

  function field(label: string) {
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...BODY);
    doc.text(label, MARGIN, y);
    doc.setDrawColor(...FIELD_RULE);
    doc.line(MARGIN + 48, y, PAGE_WIDTH - MARGIN, y);
    y += 8;
  }

  field("Date:");
  field("Landlord / freeholder name:");
  field("Landlord / freeholder address:");
  field("Your name:");
  field("Property address:");
  y += 3;

  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...PRIMARY);
  doc.text("Dear [Landlord / freeholder name],", MARGIN, y);
  y += 8;

  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...BODY);

  const paragraphs = [
    "I am writing to request your permission to install an electric vehicle (EV) chargepoint at the above property, on the private parking space allocated to my home. The installation will be carried out by an OZEV-authorised installer, Nison Limited (OZEV Installer No. 13528), and I intend to apply for the UK Government's Electric Vehicle Chargepoint Grant for Renters and Flat Owners, which requires written landlord or freeholder consent as part of the application.",
    "The chargepoint will be professionally installed and certified to current wiring regulations (BS 7671) and the Electric Vehicles (Smart Charge Points) Regulations 2021. I am happy to share the installer's quote and specification on request, and to discuss any conditions you would like to attach to your consent.",
    "Please sign and return this letter, or reply in writing, to confirm your consent for this installation.",
  ];

  for (const paragraph of paragraphs) {
    const lines = doc.splitTextToSize(paragraph, CONTENT_WIDTH);
    doc.text(lines, MARGIN, y);
    y += lines.length * 4.6 + 4;
  }

  y += 4;
  doc.text("Yours sincerely,", MARGIN, y);
  y += 12;
  field("Signature:");
  field("Print name:");
  y += 5;

  doc.setDrawColor(...RULE);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 9;

  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...PRIMARY);
  doc.text("Landlord / Freeholder Consent", MARGIN, y);
  y += 8;
  field("Signature:");
  field("Print name:");
  field("Date:");

  y += 5;
  doc.setFont("times", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  const footer = doc.splitTextToSize(
    "Provided by Nison Limited, OZEV Installer No. 13528, for use as part of your Electric Vehicle Chargepoint Grant application. This template is provided for guidance only and does not constitute legal advice.",
    CONTENT_WIDTH
  );
  doc.text(footer, MARGIN, y);

  doc.save("ocunio-energy-landlord-permission-letter-template.pdf");
}
