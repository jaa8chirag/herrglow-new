import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

interface WatermarkOptions {
  text?: string;
  opacity?: number; // e.g. 0.25
  position?: "bottom-right" | "center";
}

export async function watermarkImage(
  inputPath: string,
  outputPath: string,
  opts: WatermarkOptions = {}
) {
  const { text = "HerrGlow ©", opacity = 0.28, position = "bottom-right" } = opts;

  const metadata = await sharp(inputPath).metadata();
  const width = metadata.width || 1200;
  const height = metadata.height || 800;

  // Font size proportional to image width (around 3.5% of width, min 18px, max 48px)
  const fontSize = Math.max(18, Math.min(48, Math.round(width * 0.035)));
  const paddingX = Math.round(width * 0.03);
  const paddingY = Math.round(height * 0.03);

  let textNode = "";
  if (position === "bottom-right") {
    textNode = `<text x="${width - paddingX}" y="${height - paddingY}" text-anchor="end" class="watermark">${text}</text>`;
  } else {
    textNode = `<text x="${Math.round(width / 2)}" y="${Math.round(height / 2)}" text-anchor="middle" class="watermark">${text}</text>`;
  }

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.4)" />
        </filter>
      </defs>
      <style>
        .watermark {
          fill: rgba(255, 255, 255, ${opacity});
          font-family: 'Playfair Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif;
          font-size: ${fontSize}px;
          font-weight: 600;
          letter-spacing: 2px;
          filter: url(#shadow);
        }
      </style>
      ${textNode}
    </svg>
  `;

  // Process with sharp preserving format and quality
  const tempPath = outputPath + ".tmp.jpg";
  await sharp(inputPath)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(tempPath);

  await fs.rename(tempPath, outputPath);
  console.log(`✓ Watermarked: ${path.basename(outputPath)} (${width}x${height})`);
}

export async function watermarkDirectory(dirPath: string, opts: WatermarkOptions = {}) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(entry.name)) {
      const fullPath = path.join(dirPath, entry.name);
      await watermarkImage(fullPath, fullPath, opts);
    }
  }
}

// CLI runner
if (process.argv[1]?.endsWith("watermark.ts")) {
  const targetDir = process.argv[2];
  if (!targetDir) {
    console.error("Usage: tsx scripts/watermark.ts <directory-or-file>");
    process.exit(1);
  }

  const fullTarget = path.resolve(process.cwd(), targetDir);
  const stat = await fs.stat(fullTarget);
  if (stat.isDirectory()) {
    console.log(`Watermarking all images in ${fullTarget}...`);
    await watermarkDirectory(fullTarget);
  } else {
    console.log(`Watermarking file ${fullTarget}...`);
    await watermarkImage(fullTarget, fullTarget);
  }
  console.log("✓ Done!");
}
