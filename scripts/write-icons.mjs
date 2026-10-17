/**
 * Draws the PATTERNS favicon set into public/ before the frontend is built.
 *
 * The icons are generated rather than committed because this repository is
 * pushed through a text-only path: a .png committed as text is a corrupt
 * .png. Drawing them is also honest about where the mark comes from — the
 * same four-point star as the header, from the same numbers, so the tab icon
 * cannot drift away from the logo.
 *
 * No image library is used. PNG is a zlib stream of filtered scanlines plus
 * three CRC'd chunks, and .ico is a small header in front of whole PNG files,
 * so both are short enough to write directly and avoid a dependency.
 */

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

const INK = [31, 27, 22];      // #1F1B16 — the site's ink
const STAR = [236, 220, 189];  // #ECDCBD — warm cream, legible against it

/** Tips on the axes, waist on the diagonals. The waist ratio IS the shape:
 *  wider and it reads as a diamond in a tab, narrower and the points vanish. */
const WAIST = 0.27;

function starPolygon(c, r) {
  const w = r * WAIST;
  return [
    [c, c - r], [c + w, c - w], [c + r, c], [c + w, c + w],
    [c, c + r], [c - w, c + w], [c - r, c], [c - w, c - w],
  ];
}

function insidePolygon(pts, x, y) {
  let hit = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/** Rounded square, as a coverage test rather than a path. */
function insideTile(size, radius, x, y) {
  if (x < 0 || y < 0 || x > size || y > size) return false;
  const cx = x < radius ? radius : x > size - radius ? size - radius : x;
  const cy = y < radius ? radius : y > size - radius ? size - radius : y;
  if (cx === x || cy === y) return true;
  return (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2;
}

/**
 * Renders one tile to raw RGBA. Antialiasing is plain supersampling: sample
 * each pixel on an N x N grid and average. Slower than a real rasteriser and
 * entirely fast enough for five small images.
 */
function render(size, padRatio, radiusRatio, ss = 4) {
  const px = Buffer.alloc(size * size * 4);
  const r = size * (0.5 - padRatio);
  const star = starPolygon(size / 2, r);
  const radius = size * radiusRatio;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let tile = 0;
      let mark = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const px0 = x + (sx + 0.5) / ss;
          const py0 = y + (sy + 0.5) / ss;
          if (insideTile(size, radius, px0, py0)) tile++;
          if (insidePolygon(star, px0, py0)) mark++;
        }
      }
      const n = ss * ss;
      const tileA = tile / n;
      const markA = Math.min(mark / n, tileA); // the star never spills past the tile
      const i = (y * size + x) * 4;
      // Star over ink, then the whole thing over transparency.
      for (let c = 0; c < 3; c++) {
        const colour = tileA === 0 ? 0 : (INK[c] * (tileA - markA) + STAR[c] * markA) / tileA;
        px[i + c] = Math.round(colour);
      }
      px[i + 3] = Math.round(tileA * 255);
    }
  }
  return px;
}

const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return (buf) => {
    let c = -1;
    for (const b of buf) c = t[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
  };
})();

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(CRC(body));
  return Buffer.concat([len, body, crc]);
}

function png(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // colour type: RGBA
  // 10..12 stay zero: deflate, adaptive filtering, no interlace.

  // One filter byte per scanline. Filter 0 (none) keeps this readable; these
  // images are tiny, so the compression it costs does not matter.
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** .ico is a directory of images; each entry here is simply a whole PNG. */
function ico(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);             // type 1 = icon
  header.writeUInt16LE(entries.length, 4);

  let offset = 6 + entries.length * 16;
  const dir = [];
  for (const { size, data } of entries) {
    const e = Buffer.alloc(16);
    e[0] = size >= 256 ? 0 : size;        // 0 means 256 in this format
    e[1] = size >= 256 ? 0 : size;
    e[2] = 0;                             // palette size
    e[3] = 0;
    e.writeUInt16LE(1, 4);                // colour planes
    e.writeUInt16LE(32, 6);               // bits per pixel
    e.writeUInt32BE(0, 8);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    dir.push(e);
    offset += data.length;
  }
  return Buffer.concat([header, ...dir, ...entries.map((e) => e.data)]);
}

mkdirSync(OUT, { recursive: true });

// Tab sizes: the star nearly fills the tile and the corners are barely
// rounded. At 16px, padding turns the mark to mush.
const TAB = { pad: 0.06, radius: 0.16 };
const tab = (size) => ({ size, data: png(size, render(size, TAB.pad, TAB.radius)) });

const sizes = [16, 32, 48].map(tab);
writeFileSync(path.join(OUT, 'favicon.ico'), ico(sizes));
writeFileSync(path.join(OUT, 'favicon-32.png'), sizes[1].data);

// iOS masks its own corners, so this one is square with room to breathe.
writeFileSync(path.join(OUT, 'apple-touch-icon.png'), png(180, render(180, 0.2, 0)));

console.log('[icons] wrote favicon.ico, favicon-32.png, apple-touch-icon.png');
