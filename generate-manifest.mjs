// generate-manifest.mjs
import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

const folder = './file';
const output = './manifest.json';

async function main() {
  const files = await readdir(folder);
  const txtFiles = files.filter(f => f.endsWith('.txt'));

  const data = [];
  for (const file of txtFiles) {
    const fullPath = path.join(folder, file);
    const content = await readFile(fullPath, 'utf-8');
    const parts = content.split('---').filter(Boolean);
    const yamlContent = yaml.load(parts[0]);

    const id = file.split('_')[0];
    data.push({
      id,
      title: yamlContent.title,
      filename: file,
      category: yamlContent.category
    });
  }

  await writeFile(output, JSON.stringify(data, null, 2));
  console.log(`✅ 已成功產生 ${output}`);
}

main().catch(console.error);
