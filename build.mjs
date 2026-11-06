import { transform } from 'esbuild';
import { cp, readFile, writeFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));
const kebab = (key) => key.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
const svgAttrs = /^(stroke|fill|clip|stop|font|text|color|dominant|vector|paint|shape)[A-Z]/;
const figjam = 'https://www.figma.com/board/l9FijkVeXlcHDfCglRDwLZ/brainstorming?node-id=0-1';
const links = {
  'CQA-0': './thought-process.html',
  'DV9-0': './index.html',
  'DMX-0': './index.html',
  'DV4-0': './index.html',
  'DPK-0': figjam,
  'DRF-0': figjam,
  'DSE-0': figjam,
  'DV2-0': figjam,
  'DUF-0': 'https://app.paper.design/file/01M6NECD67XY5KD41MFZ8RQR5J/p-5-0',
  'DUK-0': 'https://app.paper.design/file/01M6NECD67XY5KD41MFZ8RQR5J/p-1-0',
  'DUP-0': 'https://github.com/Lakshya-Jain/skilledIn',
  'DUU-0': './index.html',
  'CB9-0': '#work-sample',
  'A9M-0': 'https://ponytail.dev/#install',
  'CBC-0': 'https://ponytail.dev/#install',
  'A9R-0': 'https://github.com/dietrichgebert/ponytail/blob/main/skills/ponytail/SKILL.md',
  'CB6-0': 'https://github.com/dietrichgebert/ponytail/blob/main/skills/ponytail/SKILL.md',
  'ANK-0': 'https://hub.openclaw.ai/dietrichgebert/skills/ponytail/security-audit',
  'ANU-0': '#recommendations',
  'AO9-0': 'https://github.com/dietrichgebert/ponytail/blob/main/LICENSE',
};
const anchors = {'AG8-0': 'work-sample', 'AIO-0': 'recommendations'};
let scrollHeader;
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
  const markup = '<' + tag + attributes + '>' + content + '</' + tag + '>';
  if (layer === 'A6T-0') {
    return new Markup(
      '<header class="sticky-navigation">' + markup +
      '<div class="scroll-profile" inert aria-hidden="true">' + scrollHeader.html + '</div></header>'
    );
  }
  return new Markup(markup);
}

async function render(path) {
  const { code } = await transform(await readFile(path, 'utf8'), {
    loader: 'jsx', format: 'cjs', jsxFactory: 'element',
  });
  const module = { exports: {} };
  runInNewContext(code, { module, element }, { timeout: 5000 });
  return module.exports.default();
}

scrollHeader = await render('src/scroll-header.jsx');
const profile = await render('src/profile.jsx');
const thoughtProcess = await render('src/thought-process.jsx');
await cp('public', 'dist', { recursive: true });

function page(title, content, { profile = false } = {}) {
  const script = profile ? '<script src="scroll-profile.js" defer></script>' : '';
  return '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1"><title>' +
    title + '</title><link rel="stylesheet" href="tokens.css"><link rel="stylesheet" href="site.css">' +
    script + '</head><body>' + content.html + '</body></html>';
}

await Promise.all([
  writeFile('dist/index.html', page('Ponytail · SkilledIn', profile, { profile: true })),
  writeFile('dist/thought-process.html', page('Thought process · SkilledIn', thoughtProcess)),
]);
