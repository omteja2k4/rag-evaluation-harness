// Step 1: read a PDF and return its text.
import fs from "fs";
import { PDFParse } from "pdf-parse";

export async function loadPdf(path) {
  const buffer = fs.readFileSync(path);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  return result.text;
}
