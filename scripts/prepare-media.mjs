import sharp from 'sharp';
import { readFile, writeFile, mkdir, unlink } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';

const source = resolve(process.argv[2] ?? '');
if (!source.endsWith('/docs/assets/app-store')) {
  throw new Error(
    'Supply the approved docs/assets/app-store screenshot directory',
  );
}
const selected = [
  ['phone-journal', 'iphone/light/01-journal.png'],
  ['phone-journal-dark', 'iphone/dark/01-journal.png'],
  ['tablet-reflection', 'ipad/light/02-reflection.png'],
  ['tablet-reflection-dark', 'ipad/dark/02-reflection.png'],
  ['phone-insights', 'iphone/light/03-insights.png'],
  ['phone-insights-dark', 'iphone/dark/03-insights.png'],
  ['phone-practice', 'iphone/light/04-practice.png'],
  ['phone-practice-dark', 'iphone/dark/04-practice.png'],
  ['phone-explore', 'iphone/light/05-explore.png'],
  ['phone-explore-dark', 'iphone/dark/05-explore.png'],
  ['phone-wheel', 'iphone/light/06-wheel.png'],
  ['phone-wheel-dark', 'iphone/dark/06-wheel.png'],
  ['phone-emotion', 'iphone/light/07-emotion.png'],
  ['phone-emotion-dark', 'iphone/dark/07-emotion.png'],
];

let previous = [];
try {
  previous = JSON.parse(await readFile('public/media/manifest.json', 'utf8'));
} catch (error) {
  if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT'))
    throw error;
}

await mkdir('public/media', { recursive: true });
const manifest = [];
for (const [name, path] of selected) {
  const input = await readFile(join(source, path));
  const metadata = await sharp(input).metadata();
  if (!metadata.width || !metadata.height)
    throw new Error(`Missing screenshot dimensions: ${path}`);
  const outputs = [];
  for (const width of name.startsWith('tablet-')
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

const currentFiles = new Set(
  manifest.flatMap((entry) => entry.outputs.map(({ file }) => file)),
);
for (const entry of previous) {
  for (const { file } of entry.outputs ?? []) {
    if (
      !currentFiles.has(file) &&
      /^(?:phone|tablet)-[a-z0-9-]+-(?:320|480|640|960|1440)\.webp$/.test(file)
    ) {
      await unlink(`public/media/${file}`).catch((error) => {
        if (!(
          error instanceof Error &&
          'code' in error &&
          error.code === 'ENOENT'
        ))
          throw error;
      });
    }
  }
}

await writeFile(
  'public/media/manifest.json',
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(
  JSON.stringify(
    manifest.map(({ name, source, width, height, outputs }) => ({
      name,
      source,
      width,
      height,
      outputs,
    })),
    null,
    2,
  ),
);
