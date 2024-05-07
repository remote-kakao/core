import { walk } from 'std/fs';
import denoJson from '../deno.json' with { type: 'json' };

await new Deno.Command('bunx', {
  args: ['swc', './src', '-d', 'npm/src'],
})
  .output()
  .then((res) => {
    if (!res.success) {
      console.log(res.stderr);
    }
  });
await new Deno.Command('bunx', {
  args: [
    'tsc',
    './src/mod.ts',
    '--outDir',
    'npm/src',
    '--emitDeclarationOnly',
    '--declaration',
  ],
})
  .output()
  .then((res) => {
    if (!res.success) {
      console.log(new TextDecoder().decode(res.stdout));
      console.log(new TextDecoder().decode(res.stderr));
    }
  });

for await (const file of walk(new URL('../src', import.meta.url))) {
  if (!file.isFile || !file.name.endsWith('.d.ts')) continue;

  await Deno.copyFile(
    file.path,
    new URL(`../npm/src/${file.name}`, import.meta.url),
  );
}

for await (const file of walk(new URL('../npm/src', import.meta.url))) {
  if (
    !file.isFile ||
    (!file.name.endsWith('.js') && !file.name.endsWith('.d.ts'))
  )
    continue;

  if (file.name.endsWith('.d.js')) {
    await Deno.remove(file.path);
    continue;
  }

  const content = await Deno.readTextFile(file.path);
  if (
    !(
      (content.includes('import') || content.includes('export')) &&
      content.includes('from') &&
      ".ts';"
    )
  )
    continue;

  const newContent = content.replaceAll(".ts';", "';");
  await Deno.writeTextFile(file.path, newContent);
}

const packageJson = {
  name: '@remote-kakao/core',
  version: denoJson.version,
  description:
    'A Deno/Node.js module that makes it easier to create unofficial KakaoTalk bots',
  repository: {
    type: 'git',
    url: 'git+https://github.com/remote-kakao/core.git',
  },
  license: 'MIT',
  bugs: {
    url: 'https://github.com/remote-kakao/core/issues',
  },
  module: './src/mod.js',
  exports: {
    '.': './src/mod.js',
    './adapter': {
      types: './src/adapter.d.ts',
    },
    './plugin': {
      types: './src/plugin.d.ts',
    },
  },
};

await Deno.writeTextFile(
  new URL('../npm/package.json', import.meta.url),
  JSON.stringify(packageJson, null, 2),
);
