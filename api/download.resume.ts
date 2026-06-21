import type { VercelRequest, VercelResponse } from '@vercel/node';
import path from "path";
import fs from "fs";  

export default function handler(req: VercelRequest, res: VercelResponse) {
  const filePath = path.join(process.cwd(), "src", "data", "2026KWS_Resume.pdf");

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Resume PDF file not found.");
  }

  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Disposition", "attachment; filename=2026KWS_Resume.pdf");
  res.setHeader("Content-Type", "application/pdf");
  res.send(fs.readFileSync(filePath));
}