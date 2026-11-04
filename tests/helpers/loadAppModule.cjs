const fs = require('node:fs');
const path = require('node:path');
const { Buffer } = require('node:buffer');
const ts = require('typescript');
const cache = new Map();

// Run dependency-free app models without loading Expo/native modules.
function moduleUrl(file) {
  if (cache.has(file)) return cache.get(file);
  let source = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.ts'))
    source = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText;
  source = source.replace(/from ['"]([^'"]+)['"]/g, (_, specifier) => {
    if (!specifier.startsWith('.'))
      throw new Error(`Native/package import in model test: ${specifier}`);
    const base = path.resolve(path.dirname(file), specifier);
    const resolved = [base, `${base}.js`, `${base}.ts`].find(
      (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
    );
    if (!resolved) throw new Error(`Cannot resolve ${specifier} from ${file}`);
    return `from '${moduleUrl(resolved)}'`;
  });
  const url = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
  cache.set(file, url);
  return url;
}
module.exports = { moduleUrl };
