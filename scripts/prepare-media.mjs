import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';

const source = resolve(process.argv[2] ?? '');
const icon = resolve(process.argv[3] ?? '');
if (
  !source.endsWith('/docs/assets/app-store') ||
  !icon.endsWith('/App/Resources/AppIcon.icon')
) {
  throw new Error(
    'Supply the approved screenshot directory and AppIcon.icon resource directory',
  );
}
const selected = [
  ['phone-emotion', 'iphone/light/06-emotion.png'],
  ['phone-reflection', 'iphone/light/02-reflection.png'],
  ['phone-explore', 'iphone/light/05-explore.png'],
  ['tablet-reflection', 'ipad/light/02-reflection.png'],
  ['phone-practice', 'iphone/light/04-practice.png'],
  ['phone-insights', 'iphone/dark/03-insights.png'],
];
await mkdir('public/media', { recursive: true });
const manifest = [];
for (const [name, path] of selected) {
  const input = await readFile(join(source, path));
  const metadata = await sharp(input).metadata();
  const outputs = [];
  for (const width of name.startsWith('tablet')
    ? [480, 960, 1440]
    : [320, 640, 960]) {
    const file = `${name}-${width}.webp`;
    const output = await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    await writeFile(`public/media/${file}`, output);
    outputs.push({ file, width, bytes: output.length });
  }
  manifest.push({
    name,
    source: path,
    sha256: createHash('sha256').update(input).digest('hex'),
    width: metadata.width,
    height: metadata.height,
    outputs,
  });
}
const layers = [];
for (const name of ['Spark', 'Cool', 'Warm']) {
  const input = await readFile(join(icon, `Assets/${name}.svg`));
  await mkdir('src/assets/icon', { recursive: true });
  await writeFile(`src/assets/icon/${name}.svg`, input);
  layers.push({ input });
}
const artwork = await sharp({
  create: { width: 1024, height: 1024, channels: 4, background: '#fff8ee' },
})
  .composite(layers)
  .png()
  .toBuffer();
await sharp(artwork).resize(192).png().toFile('public/media/feelory-icon.png');
await writeFile(
  'public/media/manifest.json',
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(
  JSON.stringify(
    manifest.map(({ name, width, height, outputs }) => ({
      name,
      width,
      height,
      outputs,
    })),
    null,
    2,
  ),
);
