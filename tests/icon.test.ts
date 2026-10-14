import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { createHash } from 'node:crypto';

test('Override preserves the exact approved native-rendered sRGB icon and alpha', async () => {
  const data = await readFile('public/media/override-icon.png');
  assert.equal(
    createHash('sha256').update(data).digest('hex'),
    '7e82dbd0bda6e306c11662dff132b89184a2e86c6098336b03b8798ec1ab31e7',
  );
  const metadata = await sharp(data).metadata();
  assert.equal(metadata.width, 192);
  assert.equal(metadata.height, 192);
  assert.equal(metadata.space, 'srgb');
  assert.equal(metadata.hasAlpha, true);
  assert.ok(metadata.icc);
  const { data: pixels } = await sharp(data)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  assert.equal(pixels[3], 0, 'Native transparent corner must remain intact');
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
