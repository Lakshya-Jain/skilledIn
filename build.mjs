import { transform } from 'esbuild';
import { cp, readFile, writeFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));
const kebab = (key) => key.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
const svgAttrs = /^(stroke|fill|clip|stop|font|text|color|dominant|vector|paint|shape)[A-Z]/;
const unitless = new Set(['flex', 'flexGrow', 'flexShrink', 'fontWeight', 'lineHeight', 'opacity', 'order', 'zIndex']);
const figjam = 'https://www.figma.com/board/l9FijkVeXlcHDfCglRDwLZ/brainstorming?node-id=0-1';
const repository = 'https://github.com/DietrichGebert/ponytail';
const install = 'https://ponytail.dev/#install';
const scottLogic = 'https://blog.scottlogic.com/2026/06/16/ponytail-yagni-and-the-problem-with-prompt-benchmarks.html';
const pillitteri = 'https://pasqualepillitteri.it/en/news/5720/ponytail-ai-skill-less-code';
const profileTabs = [
  { key: 'details', file: 'index.html', label: 'Skill Details' },
  { key: 'featured', file: 'featured.html', label: 'Featured' },
  { key: 'example', file: 'example.html', label: 'Example' },
];
const links = {
  'CQA-0': './thought-process.html',
  'CVJ-0': './index.html',
  'CET-0': './index.html',
  'DV9-0': './index.html',
  'DMX-0': './index.html',
  'DV4-0': './index.html',
  'EK5-0': './index.html',
  'DPK-0': figjam,
  'DRF-0': figjam,
  'DSE-0': figjam,
  'DV2-0': figjam,
  'A9M-0': install,
  'install-info': install,
  'CBC-0': install,
  'A9R-0': repository + '/blob/main/skills/ponytail/SKILL.md',
  'CB6-0': repository + '/blob/main/skills/ponytail/SKILL.md',
  'NT4-0': 'https://ponytail.dev/docs#install',
  'NT8-0': './index.html#access',
  'ANU-0': './featured.html#recommendations',
  'P5H-0': scottLogic,
  'P2B-0': scottLogic,
  'P5O-0': pillitteri,
  'P2H-0': pillitteri,
  'PSJ-0': install,
  'PSN-0': install,
  'PTE-0': install,
  'ANK-0': 'https://hub.openclaw.ai/dietrichgebert/skills/ponytail/security-audit',
  'AO9-0': repository + '/blob/main/LICENSE',
};
const buttonVariants = {
  'A9M-0': 'blue', 'CBC-0': 'blue', 'A9R-0': 'outline', 'CB6-0': 'outline',
  'DMX-0': 'dark', 'DV4-0': 'dark', 'DV2-0': 'outline',
};
const anchors = {'OQD-0': 'access', 'AIO-0': 'recommendations'};
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
    if (buttonVariants[layer]) attrs.className = 'action-link action-link--' + buttonVariants[layer];
  }
  if (anchors[layer]) attrs.id = anchors[layer];
  if (attrs.style) {
    attrs.style = Object.entries(attrs.style)
      .map(([name, value]) => {
        const cssName = kebab(name);
        const length = typeof value === 'number' && value !== 0 && !unitless.has(name);
        return cssName + ':' + (length ? value + 'px' : String(value).replaceAll('calc(infinity * 1px)', '9999px'));
      })
      .join(';');
  }
  const attributes = Object.entries(attrs).filter(([, value]) => value != null)
    .map(([name, value]) => {
      const attribute = name === 'className' ? 'class' : svgAttrs.test(name) ? kebab(name) : name;
      return ' ' + attribute + '="' + escape(value) + '"';
    }).join('');
  if (layer === 'A6S-0') {
    const [banner, navigation] = children.splice(0, 2);
    children.unshift(new Markup(
      '<header class="sticky-navigation">' + banner.html + navigation.html +
      '<div class="scroll-profile" inert aria-hidden="true">' + scrollHeader.html + '</div></header>'
    ));
  }
  const content = children.flat(Infinity).map((child) => (
    child instanceof Markup ? child.html : child == null || typeof child === 'boolean' ? '' : escape(child)
  )).join('');
  return new Markup('<' + tag + attributes + '>' + content + '</' + tag + '>');
}

async function loadRenderer(path) {
  const { code } = await transform(await readFile(path, 'utf8'), {
    loader: 'jsx', format: 'cjs', jsxFactory: 'element',
  });
  const module = { exports: {} };
  runInNewContext(code, { module, element }, { timeout: 5000 });
  return module.exports.default;
}

function renderTabs(activeTab) {
  return element('nav', { className: 'profile-tabs', 'aria-label': 'Ponytail profile sections' },
    profileTabs.map(({ key, file, label }) => element('a', {
      href: './' + file,
      'data-profile-tab': key,
      'aria-current': key === activeTab ? 'page' : null,
    }, label))
  );
}

const [renderScrollHeader, renderProfile, renderThoughtProcess] = await Promise.all([
  loadRenderer('src/scroll-header.jsx'),
  loadRenderer('src/profile.jsx'),
  loadRenderer('src/thought-process.jsx'),
]);
scrollHeader = renderScrollHeader();
const profilePanels = await Promise.all(profileTabs.map(async ({ key }) => {
  const renderContent = await loadRenderer('src/profile-' + key + '.jsx');
  return { key, content: renderContent() };
}));
await cp('public', 'dist', { recursive: true });

function page(title, content, { profile = false } = {}) {
  const script = profile ? '<script src="scroll-profile.js" defer></script>' +
    '<script src="profile-tabs.js" defer></script>' : '';
  return '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1"><title>' +
    title + '</title><link rel="stylesheet" href="tokens.css"><link rel="stylesheet" href="site.css">' +
    script + '</head><body>' + content.html + '</body></html>';
}

await Promise.all([
  ...profileTabs.map(async ({ key, file, label }) => {
    const content = profilePanels.map(panel => element('div', {
      className: 'profile-tab-panel',
      'data-profile-panel': panel.key,
      hidden: panel.key === key ? null : '',
    }, panel.content));
    const profile = renderProfile({ content, tabs: renderTabs(key) });
    await writeFile('dist/' + file, page('Ponytail · ' + label + ' · SkilledIn', profile, { profile: true }));
  }),
  writeFile('dist/thought-process.html', page('Thought process · SkilledIn', renderThoughtProcess())),
]);
