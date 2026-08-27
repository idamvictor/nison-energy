import { jsPDF } from "jspdf";

import { getGrantScheme } from "@/lib/grants";

const MARGIN = 20;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const PRIMARY: [number, number, number] = [0, 98, 122];
const MUTED: [number, number, number] = [91, 107, 114];
const BODY: [number, number, number] = [30, 41, 46];
const RULE: [number, number, number] = [222, 230, 232];

export function generateApplicationGuidePdf() {
  const scheme = getGrantScheme("renters-and-flat-owners");
  if (!scheme) return;

  const doc = new jsPDF();
  let y = MARGIN;

  const heading = (text: string, size = 13) => {
    doc.setFont("times", "bold");
    doc.setFontSize(size);
    doc.setTextColor(...PRIMARY);
    doc.text(text, MARGIN, y);
    y += size * 0.55 + 3;
  };

  const body = (text: string, size = 10, style: "normal" | "italic" = "normal", color = BODY) => {
    doc.setFont("times", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
    doc.text(lines, MARGIN, y);
    y += lines.length * size * 0.45 + 3;
  };

  const bullet = (text: string) => {
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...BODY);
    doc.text("•", MARGIN, y);
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH - 6);
    doc.text(lines, MARGIN + 5, y);
    y += lines.length * 4.5 + 1.5;
  };

  const numbered = (index: number, text: string) => {
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...PRIMARY);
    doc.text(`${index}.`, MARGIN, y);
    doc.setFont("times", "normal");
    doc.setTextColor(...BODY);
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH - 8);
    doc.text(lines, MARGIN + 7, y);
    y += lines.length * 4.5 + 2;
  };

  const rule = () => {
    doc.setDrawColor(...RULE);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 7;
  };

  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...PRIMARY);
  doc.text("OZEV Application Guide", MARGIN, y);
  y += 9;

  body(scheme.title, 9.5, "normal", MUTED);
  y += 2;
  rule();

  heading("What You'll Need Before You Start");
  (scheme.documentation ?? []).forEach(bullet);
  y += 3;

  heading("How To Apply");
  scheme.applicationSteps.forEach((step, index) => numbered(index + 1, step));
  y += 2;

  heading("Typical Turnaround");
  body(
    "Pre-approval usually takes around 10 working days once your application and documents are submitted. During busier periods this can take longer, so it's worth applying as soon as your quote and documents are ready."
  );
  y += 1;

  heading("Useful Links");
  for (const resource of scheme.resources) {
    body(`${resource.label}: ${resource.href}`, 9.5);
  }

  rule();
  body(
    "Provided by Nison Limited, OZEV Installer No. 13528. Grant amounts and scheme rules are set by OZEV/DVLA and may change — always check GOV.UK for the latest details before applying.",
    8.5,
    "italic",
    MUTED
  );

  doc.save("ocunio-energy-ozev-application-guide.pdf");
}
