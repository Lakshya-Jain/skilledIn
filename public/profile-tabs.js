const profileTabs = document.querySelector('.profile-tabs');
const tabLinks = [...profileTabs.querySelectorAll('[data-profile-tab]')];
const tabPanels = document.querySelectorAll('[data-profile-panel]');

function showProfileTab(activeLink) {
  for (const link of tabLinks) {
    if (link === activeLink) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  for (const panel of tabPanels) {
    panel.hidden = panel.dataset.profilePanel !== activeLink.dataset.profileTab;
  }
  document.title = 'Ponytail · ' + activeLink.textContent + ' · SkilledIn';
}

profileTabs.addEventListener('click', event => {
  const link = event.target.closest('[data-profile-tab]');
  if (!link || location.protocol === 'file:' || event.defaultPrevented || event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  if (link.hasAttribute('aria-current')) return;
  history.pushState(null, '', link.href);
  showProfileTab(link);
});

window.addEventListener('popstate', () => {
  const link = tabLinks.find(link => link.pathname === location.pathname);
  showProfileTab(link ?? tabLinks[0]);
});
