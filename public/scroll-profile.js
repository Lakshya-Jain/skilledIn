const navigation = document.querySelector('.sticky-navigation');
const summary = document.querySelector('.scroll-profile');
const profile = document.querySelector('[data-layer="A80-0"]');

let frame = 0;
let visible = false;
function update() {
  frame = 0;
  // The summary replaces the profile intro once its bottom clears the main nav.
  const next = profile.getBoundingClientRect().bottom <= navigation.getBoundingClientRect().bottom;
  if (next === visible) return;
  visible = next;
  summary.classList.toggle('is-visible', visible);
  summary.inert = !visible;
  summary.setAttribute('aria-hidden', String(!visible));
}

function scheduleUpdate() {
  if (!frame) frame = requestAnimationFrame(update);
}

window.addEventListener('scroll', scheduleUpdate, { passive: true });
window.addEventListener('resize', scheduleUpdate);
window.addEventListener('pageshow', scheduleUpdate);
const layoutObserver = new ResizeObserver(scheduleUpdate);
layoutObserver.observe(profile);
layoutObserver.observe(navigation);
update();
