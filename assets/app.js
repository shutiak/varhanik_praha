(() => {
  // burger menu (all sizes)
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  const close = () => {
    if (!nav || !toggle) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  const open = () => {
    if (!nav || !toggle) return;
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
  };

  if (toggle && nav) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = nav.classList.contains('is-open');
      isOpen ? close() : open();
    });

    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => close()));
  }

  const fetchJSON = async (path) => {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    return await res.json();
  };

  // NOTY
  const notyList = document.querySelector('[data-noty-list]');
  if (notyList) {
    const search = document.querySelector('[data-search-noty]');
    const sortSel = document.querySelector('[data-sort-noty]');
    const countEl = document.querySelector('[data-noty-count]');
    let all = [];
    let view = [];

    const render = () => {
      const q = (search?.value || '').trim().toLowerCase();
      view = all.filter(x =>
        !q || x.title.toLowerCase().includes(q) || x.file.toLowerCase().includes(q)
      );

      const sortBy = sortSel?.value || 'title';
      view.sort((a,b) => (a[sortBy] || '').localeCompare((b[sortBy] || ''), 'cs', { sensitivity: 'base' }));

      notyList.innerHTML = view.map(x => `
        <div class="item">
          <div class="item__main">
            <div class="item__title">${escapeHtml(x.title || x.file)}</div>
            <div class="item__meta">${escapeHtml(x.file)}</div>
          </div>
          <div class="item__actions">
            <a class="badge" href="${x.url}" target="_blank" rel="noopener">PDF</a>
          </div>
        </div>
      `).join('');

      if (countEl) countEl.textContent = `Zobrazeno: ${view.length} položek`;
    };

    fetchJSON('data/noty.json')
      .then(data => { all = data; render(); })
      .catch(err => { notyList.innerHTML = `<div class="note">Nepodařilo se načíst noty.</div>`; console.error(err); });

    search?.addEventListener('input', render);
    sortSel?.addEventListener('change', render);
  }

  // NEWS
  const newsList = document.querySelector('[data-news-list]');
  if (newsList) {
    fetchJSON('data/news.json')
      .then(items => {
        newsList.innerHTML = items.map(it => {
          const links = (it.links || []).map(l => {
            const label = l.text || 'Otevřít';
            return `<a class="badge" href="${l.href}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`;
          }).join('');
          return `
            <div class="item">
              <div class="item__main">
                <div class="item__title">${escapeHtml(it.title)}</div>
                <div class="item__meta">${escapeHtml(it.desc || '')}</div>
              </div>
              <div class="item__actions">${links}</div>
            </div>
          `;
        }).join('');
      })
      .catch(err => { newsList.innerHTML = `<div class="note">Nepodařilo se načíst novinky.</div>`; console.error(err); });
  }

  // LINKS
  const linksList = document.querySelector('[data-links-list]');
  if (linksList) {
    const search = document.querySelector('[data-search-links]');
    let all = [];

    const render = () => {
      const q = (search?.value || '').trim().toLowerCase();
      const view = all.filter(x => !q || x.title.toLowerCase().includes(q) || x.url.toLowerCase().includes(q));
      linksList.innerHTML = view.map(x => `
        <div class="item">
          <div class="item__main">
            <div class="item__title">${escapeHtml(x.title)}</div>
            <div class="item__meta">${escapeHtml(x.url)}</div>
          </div>
          <div class="item__actions">
            <a class="badge" href="${x.url}" target="_blank" rel="noopener">Otevřít</a>
          </div>
        </div>
      `).join('');
    };

    fetchJSON('data/odkazy.json')
      .then(data => { all = data; render(); })
      .catch(err => { linksList.innerHTML = `<div class="note">Nepodařilo se načíst odkazy.</div>`; console.error(err); });

    search?.addEventListener('input', render);
  }

  function escapeHtml(str){
    return String(str)
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'",'&#039;');
  }
})();
