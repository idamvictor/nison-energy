"use client";

// Turn rendered emails (exactly as customers see them) into an A4 PDF in the
// browser: each email is drawn in an off-screen iframe, captured with
// html2canvas and sliced onto pages with jsPDF. Each email starts a new page
// with a small header (template, version, subject).

import type { RenderedEmail } from "@/lib/email/template-actions";

const EMAIL_WIDTH = 640;

/** The email logo points at the live site; load it from this origin so the canvas isn't tainted. */
const localiseImages = (html: string) =>
  html.replace(/src="https?:\/\/[^"]*\/ocunio-energy-logo\.png"/g, `src="${window.location.origin}/ocunio-energy-logo.png"`);

async function captureEmail(html: string): Promise<HTMLCanvasElement> {
  const { default: html2canvas } = await import("html2canvas");
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${EMAIL_WIDTH}px;height:2000px;border:0;visibility:hidden`;
  document.body.appendChild(frame);
  try {
    const doc = frame.contentDocument!;
    doc.open();
    doc.write(localiseImages(html));
    doc.close();
    await Promise.all(
      [...doc.images].map((img) =>
        img.complete ? Promise.resolve() : new Promise((r) => ((img.onload = r), (img.onerror = r))),
      ),
    );
    const body = doc.body;
    frame.style.height = `${body.scrollHeight}px`;
    return await html2canvas(body, {
      backgroundColor: "#f1f6f8",
      scale: 2,
      useCORS: true,
      width: EMAIL_WIDTH,
      windowWidth: EMAIL_WIDTH,
      height: body.scrollHeight,
    });
  } finally {
    frame.remove();
  }
}

/** Download one or more emails as a single PDF. */
export async function downloadEmailsPdf(emails: RenderedEmail[], fileName: string): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const headerH = 16;
  const imgW = pageW - margin * 2;

  for (const [index, email] of emails.entries()) {
    if (index > 0) pdf.addPage();
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text(`${email.label}${email.variant !== "Example" ? ` — ${email.variant}` : ""}`, margin, margin + 4);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(pdf.splitTextToSize(`Subject: ${email.subject}`, imgW), margin, margin + 10);

    const canvas = await captureEmail(email.html);
    const mmPerPx = imgW / canvas.width;
    let top = margin + headerH; // first page starts under the header
    let srcY = 0;
    while (srcY < canvas.height) {
      const room = pageH - margin - top;
      const sliceH = Math.min(canvas.height - srcY, Math.floor(room / mmPerPx));
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = sliceH;
      slice.getContext("2d")!.drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      pdf.addImage(slice.toDataURL("image/jpeg", 0.92), "JPEG", margin, top, imgW, sliceH * mmPerPx);
      srcY += sliceH;
      if (srcY < canvas.height) {
        pdf.addPage();
        top = margin;
      }
    }
  }
  pdf.save(fileName);
}
