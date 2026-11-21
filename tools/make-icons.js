// Generates the app icons (a steaming bowl on terracotta) as PNGs with no dependencies.
// Usage: node tools/make-icons.js
const fs = require("fs"), path = require("path"), zlib = require("zlib");

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, pixel) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      // 4x supersampling for smooth edges
      let r = 0, g = 0, b = 0;
      for (let sy = 0; sy < 2; sy++) for (let sx = 0; sx < 2; sx++) {
        const [pr, pg, pb] = pixel((x + (sx + 0.5) / 2) / size, (y + (sy + 0.5) / 2) / size);
        r += pr; g += pg; b += pb;
      }
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = r / 4; raw[o + 1] = g / 4; raw[o + 2] = b / 4; raw[o + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

const BG = [200, 85, 61], WHITE = [255, 250, 244], CREAM = [246, 223, 216];
// Artwork stays inside the central 60% so it survives "maskable" circle cropping.
function bowl(u, v) {
  const x = u - 0.5, y = v - 0.5;
  // bowl body: lower half of a circle
  if (y > 0.02 && x * x + (y - 0.02) * (y - 0.02) < 0.27 * 0.27) return WHITE;
  // rim
  if (Math.abs(y - 0.02) < 0.025 && Math.abs(x) < 0.3) return WHITE;
  // foot
  if (y > 0.29 && y < 0.32 && Math.abs(x) < 0.1) return WHITE;
  // three wavy steam lines
  for (const cx of [-0.11, 0, 0.11]) {
    const wave = cx + 0.025 * Math.sin((y + 0.3) * 28);
    if (y > -0.27 && y < -0.05 && Math.abs(x - wave) < 0.018) return CREAM;
  }
  return BG;
}
const out = path.join(__dirname, "..", "icons");
fs.mkdirSync(out, { recursive: true });
for (const s of [192, 512, 180]) fs.writeFileSync(path.join(out, `icon-${s}.png`), png(s, bowl));
console.log("icons written to", out);
