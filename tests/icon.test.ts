import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { createHash } from 'node:crypto';

test('Override preserves every approved W2/M2 asset byte-for-byte', async () => {
  const hashes = {
    'override-icon.png':
      'c6b60b35e187baaa8695307e3dded92db3b1ac58f0f88b3b9910251f537714a0',
    'override-icon-64.png':
      '2865659a256bedb1f339dc60c96c7239f142945908baabd4e2d8b5c9ff733b58',
    'override-icon-128.png':
      '5bd2609ed86d10edebd63b122dd974cbff10b952a9d19b1d72d349d91e2d2e44',
    'override-icon-192.png':
      'c6b60b35e187baaa8695307e3dded92db3b1ac58f0f88b3b9910251f537714a0',
    'override-icon-dark-64.png':
      'b159d40c0c2333e42c18ab3836692fcf196c283fd65fdf1bbf91d082df8bbd1d',
    'override-icon-dark-128.png':
      '05d59f1497e8b07cffee31919a8c2d64209882ec22d66cd63bba4700f8e8a513',
    'override-icon-dark-192.png':
      'bd4eaae9186a358d10d0c27f1b301102d7211424e17a7694d3c152e28486f891',
    'override-social-card.png':
      '586c7d1b71f6730803bd7c5d2e46a90272593d1296c2c5c46c60404ccf75c741',
    'menubar/override-menubar-ready.svg':
      '54cf9b43e6855ddeebd54979ee41cc326bac6eb5e84f448b15a6b2b400a8df17',
    'menubar/override-menubar-accessibility-missing.svg':
      'a92f8433d61304cfdd2cb961a8a964fcdbd928a1f0220ef6f7f06c87b299e8b8',
    'menubar/override-menubar-paused.svg':
      '2ff6945e4576649498673c77e420f5b8744784f5c2f447aff1acc092c74b7c6f',
    'menubar/override-menubar-stashed.svg':
      '60acc9787f56861d803ca7b73fac0242c45eb36c8cf5b5f19b8d709cef6d9f33',
  };
  for (const [name, hash] of Object.entries(hashes)) {
    const path = name.startsWith('menubar/')
      ? `src/assets/override/${name}`
      : `public/media/${name}`;
    const data = await readFile(path);
    assert.equal(createHash('sha256').update(data).digest('hex'), hash, name);
    if (name.endsWith('.svg')) {
      assert.match(data.toString(), /viewBox="0 0 26 20"/);
      assert.match(data.toString(), /fill="currentColor"/);
      continue;
    }
    const metadata = await sharp(data).metadata();
    const social = name === 'override-social-card.png';
    const size = Number(name.match(/-(64|128|192)\.png$/)?.[1] ?? 192);
    assert.equal(metadata.width, social ? 1200 : size, name);
    assert.equal(metadata.height, social ? 630 : size, name);
    assert.equal(metadata.space, 'srgb');
    assert.ok(metadata.icc);
    if (!social) {
      assert.equal(metadata.hasAlpha, true);
      const pixels = await sharp(data).ensureAlpha().raw().toBuffer();
      assert.equal(pixels[3], 0, `${name}: preserve transparent corners`);
    }
  }
  assert.deepEqual(
    await readFile('public/media/override-icon.png'),
    await readFile('public/media/override-icon-192.png'),
  );
});

test('the genuine Spark layer remains foreground in every shared Feelory icon', async () => {
  const expected = await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: '#fff8ee',
    },
  })
    .composite(
      await Promise.all(
        ['Warm', 'Cool', 'Spark'].map(async (name) => ({
          input: await readFile(`src/assets/icon/${name}.svg`),
        })),
      ),
    )
    .png()
    .toBuffer();
  const expectedPixels = await sharp(expected)
    .resize(192)
    .ensureAlpha()
    .raw()
    .toBuffer();
  const actual = await sharp('public/media/feelory-icon.png')
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  assert.equal(actual.info.width, 192);
  assert.equal(actual.info.height, 192);
  assert.deepEqual(actual.data, expectedPixels);

  // The overlapping center must be the pale Spark, not the warm/cool lobes.
  const offset = (80 * actual.info.width + 96) * actual.info.channels;
  const center = [...actual.data.subarray(offset, offset + 4)];
  assert.ok(
    center[0]! >= 250 && center[1]! >= 220 && center[2]! >= 230,
    `Neutral middle missing: ${center.join(',')}`,
  );
  assert.equal(center[3], 255);
});
