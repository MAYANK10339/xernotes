import fs from 'fs';
import zlib from 'zlib';

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crc]);
}

function createPng(size, isMaskable = false) {
  const width = size;
  const height = size;

  // Raw RGBA scanlines: 1 filter byte + width * 4 bytes per row
  const rowLen = 1 + width * 4;
  const rawData = Buffer.alloc(rowLen * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * (isMaskable ? 0.45 : 0.42);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLen;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background: Deep dark slate (#090d16)
      let r = 9, g = 13, b = 22, a = 255;

      // Outer app icon container (rounded rect effect or circle)
      const cornerR = width * 0.22;
      const insideRoundedBox = 
        Math.abs(dx) <= (width * 0.44 - cornerR) && Math.abs(dy) <= (height * 0.44) ||
        Math.abs(dy) <= (height * 0.44 - cornerR) && Math.abs(dx) <= (width * 0.44) ||
        (Math.hypot(Math.abs(dx) - (width * 0.44 - cornerR), Math.abs(dy) - (height * 0.44 - cornerR)) <= cornerR);

      if (insideRoundedBox) {
        // Gradient from Indigo (#6366f1) to Violet (#8b5cf6) to Cyan (#06b6d4)
        const t = (x + y) / (width + height);
        r = Math.round(99 * (1 - t) + 139 * t);
        g = Math.round(102 * (1 - t) + 92 * t);
        b = Math.round(241 * (1 - t) + 246 * t);

        // Center symbol: stylized notebook / shield / "X" symbol
        const bookW = width * 0.44;
        const bookH = height * 0.52;
        if (Math.abs(dx) <= bookW / 2 && Math.abs(dy) <= bookH / 2) {
          // Inner notebook card (#0f172a / dark slate)
          r = 15; g = 23; b = 42;
          
          // Note lines
          const lineY1 = Math.abs(dy + height * 0.08);
          const lineY2 = Math.abs(dy);
          const lineY3 = Math.abs(dy - height * 0.08);
          if ((lineY1 <= width * 0.015 || lineY2 <= width * 0.015 || lineY3 <= width * 0.015) && Math.abs(dx) <= bookW * 0.35) {
            r = 99; g = 102; b = 241; // indigo accent line
          }

          // Top lock/star accent
          if (Math.hypot(dx, dy + height * 0.16) <= width * 0.04) {
            r = 16; g = 185; b = 129; // emerald secure dot
          }
        }
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: 6 (RGBA)
  ihdr[10] = 0; // Compression method: 0
  ihdr[11] = 0; // Filter method: 0
  ihdr[12] = 0; // Interlace method: 0

  const compressedData = zlib.deflateSync(rawData);

  const png = Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressedData),
    makeChunk('IEND', Buffer.alloc(0))
  ]);

  return png;
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

fs.writeFileSync('public/pwa-192x192.png', createPng(192));
fs.writeFileSync('public/pwa-512x512.png', createPng(512));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPng(512, true));
fs.writeFileSync('public/apple-touch-icon.png', createPng(180));
fs.writeFileSync('public/favicon.ico', createPng(64));

console.log('Icons generated successfully!');
