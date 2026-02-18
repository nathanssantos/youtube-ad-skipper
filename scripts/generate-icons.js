import { writeFileSync, mkdirSync } from "fs";
import { deflateSync } from "zlib";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICON_DIR = join(__dirname, "..", "icons");
mkdirSync(ICON_DIR, { recursive: true });

const crc32 = (data) => {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const makeChunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, "ascii");
  const crcInput = Buffer.concat([typeBuffer, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([len, typeBuffer, data, crcBuf]);
};

const SIZES = [16, 32, 48, 128];

for (const size of SIZES) {
  const pixels = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const cr = size * 0.15;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;

      let inside = false;
      if (x >= cr && x < size - cr) inside = true;
      else if (y >= cr && y < size - cr) inside = true;
      else {
        for (const [ccx, ccy] of [[cr, cr], [size - cr, cr], [cr, size - cr], [size - cr, size - cr]]) {
          if ((x - ccx) ** 2 + (y - ccy) ** 2 <= cr * cr) {
            inside = true;
            break;
          }
        }
      }

      if (!inside) continue;

      const grad = 1 - (x + y) / (size * 2) * 0.2;
      pixels[i] = Math.round(220 * grad);
      pixels[i + 1] = Math.round(20 * grad);
      pixels[i + 2] = Math.round(20 * grad);
      pixels[i + 3] = 255;

      const pad = size * 0.28;
      const tl = cx - size * 0.15;
      const tr = cx + size * 0.3;
      const tt = cy - size * 0.25;
      const tb = cy + size * 0.25;

      if (y >= tt && y <= tb) {
        const t = (y - tt) / (tb - tt);
        const edgeL = tl + (tr - tl) * Math.abs(t - 0.5);

        if (x >= edgeL && x <= tr) {
          pixels[i] = 255;
          pixels[i + 1] = 255;
          pixels[i + 2] = 255;
          pixels[i + 3] = 255;
        }
      }
    }
  }

  const raw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    raw[y * (1 + size * 4)] = 0;
    rgbaData: for (let x = 0; x < size; x++) {
      const s = (y * size + x) * 4;
      const d = y * (1 + size * 4) + 1 + x * 4;
      raw[d] = pixels[s];
      raw[d + 1] = pixels[s + 1];
      raw[d + 2] = pixels[s + 2];
      raw[d + 3] = pixels[s + 3];
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    makeChunk("IHDR", ihdr),
    makeChunk("IDAT", deflateSync(raw)),
    makeChunk("IEND", Buffer.alloc(0)),
  ]);

  writeFileSync(join(ICON_DIR, `icon${size}.png`), png);
  console.log(`Generated icon${size}.png (${size}x${size})`);
}
