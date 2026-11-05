import { transform } from 'esbuild';
import { cp, readFile, writeFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));
const kebab = (key) => key.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
const svgAttrs = /^(stroke|fill|clip|stop|font|text|color|dominant|vector|paint|shape)[A-Z]/;
const links = {
  '4MJ-0': '#work-sample',
  '4ME-0': 'https://ponytail.dev/#install',
  '4M9-0': '#skill-source',
  '4PK-0': 'https://ponytail.dev/#before-after',
  '4P5-0': 'https://github.com/dietrichgebert/ponytail',
  '4GD-0': 'https://github.com/dietrichgebert/ponytail/blob/main/benchmarks/results/2026-10-07-agentic.md',
};
const anchors = {'4P7-0': 'work-sample', '4CZ-0': 'skill-source'};
class Markup {
  constructor(html) { this.html = html; }
}
function element(tag, props, ...children) {
  const attrs = { ...props };
  const layer = attrs['data-layer'];
  if (links[layer]) {
    tag = 'a';
    attrs.href = links[layer];
  }
  if (anchors[layer]) attrs.id = anchors[layer];
  if (attrs.style) {
    attrs.style = Object.entries(attrs.style)
      .map(([name, value]) => kebab(name) + ':' + String(value).replaceAll('calc(infinity * 1px)', '9999px'))
      .join(';');
  }
  const attributes = Object.entries(attrs).filter(([, value]) => value != null)
    .map(([name, value]) => {
      const attribute = name === 'className' ? 'class' : svgAttrs.test(name) ? kebab(name) : name;
      return ' ' + attribute + '="' + escape(value) + '"';
    }).join('');
  const content = children.flat(Infinity).map((child) => (
    child instanceof Markup ? child.html : child == null || typeof child === 'boolean' ? '' : escape(child)
  )).join('');
  return new Markup('<' + tag + attributes + '>' + content + '</' + tag + '>');
}

const { code } = await transform(await readFile('src/profile.jsx', 'utf8'), {
  loader: 'jsx', format: 'cjs', jsxFactory: 'element',
});
const module = { exports: {} };
runInNewContext(code, { module, element }, { timeout: 5000 });
await cp('public', 'dist', { recursive: true });
await writeFile('dist/index.html', '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ponytail · SkilledIn</title><link rel="stylesheet" href="tokens.css"><link rel="stylesheet" href="site.css"></head><body>' + module.exports.default().html + '</body></html>');
