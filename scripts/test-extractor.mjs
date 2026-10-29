import { createRequire } from "module";

// Quick smoke-test of the PDF extractor logic in Node.js
// Run with: node --experimental-vm-modules scripts/test-extractor.mjs

const req = createRequire(import.meta.url);

function getWorkerSrc() {
  const workerPath = req.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs");
  return new URL("file:///" + workerPath.replace(/\\/g, "/")).href;
}

async function main() {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjsLib.GlobalWorkerOptions.workerSrc = getWorkerSrc();
  console.log("Worker src:", pdfjsLib.GlobalWorkerOptions.workerSrc);

  // Minimal valid PDF with text content
  const MINIMAL_PDF = `%PDF-1.4
1 0 obj
<</Type /Catalog /Pages 2 0 R>>
endobj

2 0 obj
<</Type /Pages /Kids [3 0 R] /Count 1>>
endobj

3 0 obj
<</Type /Page /MediaBox [0 0 612 792] /Parent 2 0 R /Contents 4 0 R /Resources <</Font <</F1 5 0 R>>>>>>
endobj

4 0 obj
<</Length 44>>
stream
BT /F1 12 Tf 100 700 Td (Hello World) Tj ET
endstream
endobj

5 0 obj
<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000360 00000 n 

trailer
<</Size 6 /Root 1 0 R>>
startxref
441
%%EOF`;

  const buf = Buffer.from(MINIMAL_PDF, "latin1");
  const uint8Array = new Uint8Array(buf);

  const loadingTask = pdfjsLib.getDocument({
    data: uint8Array,
    disableFontFace: true,
    verbosity: 0,
    disableStream: true,
    disableAutoFetch: true,
  });

  try {
    const doc = await loadingTask.promise;
    console.log("✓ PDF loaded. Page count:", doc.numPages);

    const page = await doc.getPage(1);
    const textContent = await page.getTextContent();
    const text = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    console.log("✓ Extracted text:", JSON.stringify(text));
    console.log("\nExtractor is working correctly!");
  } catch (e) {
    console.error("✗ Failed:", e.message);
  }
}

main();

