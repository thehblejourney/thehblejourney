(function(){
  const section = document.getElementById('hble-in-motion');
  if (!section) return;

  const featured = section.querySelector('[data-motion-featured]');
  const strip = section.querySelector('[data-motion-strip]');
  const filters = section.querySelector('[data-motion-filters]');
  const count = section.querySelector('[data-motion-count]');
  const titleNode = section.querySelector('[data-motion-section-title]');
  const subNode = section.querySelector('[data-motion-section-subtitle]');

  let allItems = [];
  let visibleItems = [];
  let activeId = null;

  function mediaElement(item){
    if (item.type === 'video') {
      const video = document.createElement('video');
      video.className = 'hble-motion-media';
      video.src = item.src;
      if (item.poster) video.poster = item.poster;
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.loop = true;
      video.setAttribute('style','display:block!important');
      return video;
    }
    const img = document.createElement('img');
    img.className = 'hble-motion-media';
    img.src = item.src;
    img.alt = item.alt || item.title || 'HBLE In Motion media';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.setAttribute('style','display:block!important');
    return img;
  }

  function renderFeatured(item){
    if (!item || !featured) return;
    activeId = item.id;
    featured.innerHTML = '';

    const mediaWrap = document.createElement('div');
    mediaWrap.className = 'hble-motion-media-wrap';
    mediaWrap.appendChild(mediaElement(item));

    const copy = document.createElement('div');
    copy.className = 'hble-motion-copy';
    const category = document.createElement('div');
    category.className = 'hble-motion-category';
    category.textContent = item.category || 'HBLE';
    const heading = document.createElement('h3');
    heading.className = 'hble-motion-item-title';
    heading.textContent = item.title || 'HBLE In Motion';
    const body = document.createElement('p');
    body.textContent = item.description || 'A living showcase of HBLE brand motion, visual direction and creative work.';

    copy.append(category, heading, body);
    featured.append(mediaWrap, copy);
    renderStrip();
  }

  function thumbMedia(item){
    if (item.poster || item.type === 'image') {
      const img = document.createElement('img');
      img.src = item.poster || item.src;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.setAttribute('style','display:block!important');
      return img;
    }
    const ph = document.createElement('div');
    ph.className = 'hble-motion-thumb-placeholder';
    ph.textContent = item.type === 'video' ? 'VIDEO' : 'HBLE';
    return ph;
  }

  function renderStrip(){
    if (!strip) return;
    strip.innerHTML = '';
    visibleItems.forEach(function(item){
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'hble-motion-thumb' + (item.id === activeId ? ' is-active' : '');
      button.setAttribute('aria-label','Show ' + (item.title || 'HBLE media'));
      button.appendChild(thumbMedia(item));

      const copy = document.createElement('div');
      copy.className = 'hble-motion-thumb-copy';
      const small = document.createElement('small');
      small.textContent = item.category || 'HBLE';
      const strong = document.createElement('strong');
      strong.textContent = item.title || 'HBLE In Motion';
      copy.append(small, strong);
      button.appendChild(copy);
      button.addEventListener('click', function(){ renderFeatured(item); });
      strip.appendChild(button);
    });
    if (count) count.textContent = visibleItems.length + (visibleItems.length === 1 ? ' piece' : ' pieces');
  }

  function setFilter(category){
    visibleItems = category === 'All' ? allItems.slice() : allItems.filter(function(item){ return item.category === category; });
    filters.querySelectorAll('button').forEach(function(btn){
      btn.classList.toggle('is-active', btn.dataset.category === category);
    });
    const next = visibleItems.find(function(item){ return item.id === activeId; }) || visibleItems[0];
    if (next) renderFeatured(next);
    else if (featured) featured.innerHTML = '<div class="hble-motion-empty">No media has been added to this category yet.</div>';
  }

  function renderFilters(){
    if (!filters) return;
    const categories = ['All'].concat(Array.from(new Set(allItems.map(function(item){ return item.category; }).filter(Boolean))));
    filters.innerHTML = '';
    categories.forEach(function(category){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'hble-motion-filter' + (category === 'All' ? ' is-active' : '');
      btn.textContent = category;
      btn.dataset.category = category;
      btn.addEventListener('click', function(){ setFilter(category); });
      filters.appendChild(btn);
    });
  }

  fetch('/media/hble-motion/manifest.json', { cache: 'no-store' })
    .then(function(response){ if (!response.ok) throw new Error('Manifest failed'); return response.json(); })
    .then(function(data){
      if (titleNode && data.sectionTitle) titleNode.textContent = data.sectionTitle;
      if (subNode && data.sectionSubtitle) subNode.textContent = data.sectionSubtitle;
      allItems = Array.isArray(data.items) ? data.items.filter(function(item){ return item && item.src && item.type; }) : [];
      visibleItems = allItems.slice();
      renderFilters();
      const first = allItems.find(function(item){ return item.featured; }) || allItems[0];
      if (first) renderFeatured(first);
      else if (featured) featured.innerHTML = '<div class="hble-motion-empty">HBLE In Motion is ready for its first media file.</div>';
    })
    .catch(function(){
      if (featured) featured.innerHTML = '<div class="hble-motion-empty">HBLE In Motion is ready. Add media entries to <strong>media/hble-motion/manifest.json</strong>.</div>';
    });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){ if (entry.isIntersecting) section.classList.add('is-visible'); });
    }, { threshold: .2 });
    observer.observe(section);
  } else {
    section.classList.add('is-visible');
  }
})();
