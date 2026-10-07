(() => {
  'use strict';
  const menu = document.querySelector('.mobile-menu');
  if (menu) {
    document.addEventListener('click', event => { if (!menu.contains(event.target)) menu.open = false; });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); } });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
  }
  const explorer = document.querySelector('[data-research-explorer]');
  if (explorer) {
    const options = [...explorer.querySelectorAll('[data-research-topic]')];
    const panels = [...explorer.querySelectorAll('.explorer-panel')];
    const selectTopic = button => {
      explorer.dataset.topic = button.dataset.researchTopic;
      options.forEach(option => option.setAttribute('aria-pressed', String(option === button)));
      panels.forEach(panel => { panel.hidden = panel.id !== button.getAttribute('aria-controls'); });
    };
    options.forEach(button => button.addEventListener('click', () => selectTopic(button)));
    explorer.querySelector('.explorer-options').hidden = false;
  }
  const browser = document.querySelector('.publication-browser');
  if (!browser) return;
  const search = document.querySelector('#paper-search');
  const year = document.querySelector('#year-filter');
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const rows = [...document.querySelectorAll('.publication-row')];
  const groups = [...document.querySelectorAll('.year-group')];
  const count = document.querySelector('#result-count');
  const empty = document.querySelector('.empty-state');
  const clear = document.querySelector('#clear-filters');
  let category = 'all';
  const isZh = document.documentElement.lang === 'zh-CN';
  const filterBar = document.querySelector('.filter-bar');
  filterBar.hidden = false;
  document.querySelector('.filter-form').hidden = false;
  const params = new URLSearchParams(location.search);
  const initialCategory = params.get('topic');
  if (buttons.some(button => button.dataset.filter === initialCategory)) category = initialCategory;
  if ([...year.options].some(option => option.value === params.get('year'))) year.value = params.get('year');
  search.value = params.get('q') || '';
  const searchText = new Map(rows.map(row => [row, row.textContent.normalize('NFKC').toLocaleLowerCase()]));
  function render(sync = true) {
    const query = search.value.trim().normalize('NFKC').toLocaleLowerCase();
    const words = query.split(/\s+/).filter(Boolean);
    let shown = 0;
    rows.forEach(row => {
      const matches = (category === 'all' || row.dataset.domains.split(' ').includes(category)) && (year.value === 'all' || row.dataset.year === year.value) && words.every(word => searchText.get(row).includes(word));
      row.hidden = !matches;
      shown += Number(matches);
    });
    groups.forEach(group => { group.hidden = ![...group.querySelectorAll('.publication-row')].some(row => !row.hidden); });
    buttons.forEach(button => { const active = button.dataset.filter === category; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
    count.textContent = isZh ? `${shown} 篇论文` : `${shown} ${shown === 1 ? 'publication' : 'publications'}`;
    empty.hidden = shown !== 0;
    if (sync) {
      const next = new URL(location.href);
      for (const key of ['q','topic','year']) next.searchParams.delete(key);
      if (search.value.trim()) next.searchParams.set('q',search.value.trim());
      if (category !== 'all') next.searchParams.set('topic',category);
      if (year.value !== 'all') next.searchParams.set('year',year.value);
      history.replaceState(null,'',next);
    }
    document.querySelectorAll('.languages a').forEach(link => {
      const url = new URL(link.href);
      url.search = location.search;
      url.hash = location.hash;
      link.href = url.href;
    });
  }
  buttons.forEach(button => button.addEventListener('click', () => { category = button.dataset.filter; render(); }));
  search.addEventListener('input', () => render());
  year.addEventListener('change', () => render());
  document.querySelector('.filter-form').addEventListener('submit', event => event.preventDefault());
  clear.addEventListener('click', () => { category = 'all'; search.value = ''; year.value = 'all'; render(); search.focus(); });
  render(false);
})();
