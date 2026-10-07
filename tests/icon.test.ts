import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

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
