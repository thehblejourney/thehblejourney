(function () {
  'use strict';

  const config = window.HBLE_STUDIO_CONFIG;
  const services = window.HBLE_DESIGN_SERVICES;
  if (!config || !Array.isArray(services)) return;

  const state = { selected: new Set(), category: 'All' };
  const byId = new Map(services.map(service => [service.id, service]));

  const els = {
    filters: document.getElementById('service-filters'),
    grid: document.getElementById('service-grid'),
    count: document.getElementById('selection-count'),
    names: document.getElementById('selection-names'),
    clear: document.getElementById('clear-selection'),
    continue: document.getElementById('continue-request'),
    formSection: document.getElementById('request'),
    dynamic: document.getElementById('service-questions'),
    form: document.getElementById('design-request-form'),
    selectedHidden: document.getElementById('selected-services-field'),
    detailsHidden: document.getElementById('service-details-field'),
    addOnsHidden: document.getElementById('addons-field'),
    status: document.getElementById('studio-status'),
    addons: document.getElementById('addon-grid'),
    startButton: document.getElementById('start-design-request')
  };

  function announce(message) {
    if (els.status) els.status.textContent = message;
  }

  function renderFilters() {
    els.filters.innerHTML = '';
    config.categories.forEach(category => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'filter-chip' + (state.category === category ? ' is-active' : '');
      button.textContent = category;
      button.setAttribute('aria-pressed', state.category === category ? 'true' : 'false');
      button.addEventListener('click', () => {
        state.category = category;
        renderFilters();
        renderServices();
      });
      els.filters.appendChild(button);
    });
  }

  function renderServices() {
    els.grid.innerHTML = '';
    const filtered = services.filter(service => state.category === 'All' || service.category === state.category);

    filtered.forEach(service => {
      const selected = state.selected.has(service.id);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'service-card' + (selected ? ' is-selected' : '');
      card.setAttribute('aria-pressed', selected ? 'true' : 'false');
      card.dataset.serviceId = service.id;
      card.innerHTML = `
        <span class="service-check" aria-hidden="true">${selected ? '✓' : '+'}</span>
        <span class="service-category">${escapeHtml(service.category)}</span>
        <strong>${escapeHtml(service.title)}</strong>
        <span class="service-description">${escapeHtml(service.description)}</span>
        <span class="service-quote">Custom quote after review</span>`;
      card.addEventListener('click', () => toggleService(service.id));
      els.grid.appendChild(card);
    });
  }

  function toggleService(id) {
    if (state.selected.has(id)) state.selected.delete(id);
    else state.selected.add(id);
    renderServices();
    updateSelectionSummary();
  }

  function updateSelectionSummary() {
    const chosen = [...state.selected].map(id => byId.get(id)).filter(Boolean);
    els.count.textContent = chosen.length === 1 ? '1 service selected' : `${chosen.length} services selected`;
    els.names.textContent = chosen.length ? chosen.map(service => service.title).join(' • ') : 'Choose one or more services to build your request.';
    els.continue.disabled = chosen.length === 0;
    els.clear.disabled = chosen.length === 0;
    els.selectedHidden.value = chosen.map(service => service.title).join(' | ');
  }

  function fieldMarkup(service, field) {
    const id = `${service.id}__${field.id}`;
    const common = `class="detail-input" data-service="${escapeAttr(service.id)}" data-field="${escapeAttr(field.id)}" data-label="${escapeAttr(field.label)}" id="${escapeAttr(id)}"`;
    let control = '';

    if (field.type === 'textarea') {
      control = `<textarea ${common} placeholder="${escapeAttr(field.placeholder || '')}"></textarea>`;
    } else if (field.type === 'select') {
      control = `<select ${common}>${(field.options || []).map(option => `<option value="${escapeAttr(option)}">${escapeHtml(option)}</option>`).join('')}</select>`;
    } else {
      control = `<input ${common} type="${escapeAttr(field.type || 'text')}" placeholder="${escapeAttr(field.placeholder || '')}">`;
    }

    return `<div class="detail-field"><label for="${escapeAttr(id)}">${escapeHtml(field.label)}</label>${control}</div>`;
  }

  function buildQuestions() {
    els.dynamic.innerHTML = '';
    const chosen = [...state.selected].map(id => byId.get(id)).filter(Boolean);

    chosen.forEach(service => {
      const template = config.fieldTemplates[service.template] || [];
      const fields = [...template, ...(service.extraFields || [])];
      const section = document.createElement('section');
      section.className = 'service-detail-panel';
      section.dataset.serviceId = service.id;
      section.innerHTML = `
        <div class="service-detail-heading">
          <span>${escapeHtml(service.category)}</span>
          <h3>${escapeHtml(service.title)}</h3>
          <p>${escapeHtml(service.description)}</p>
        </div>
        <div class="detail-grid">${fields.map(field => fieldMarkup(service, field)).join('')}</div>`;
      els.dynamic.appendChild(section);
    });
  }

  function openRequest() {
    if (!state.selected.size) {
      announce('Choose at least one service first.');
      return;
    }
    buildQuestions();
    els.formSection.hidden = false;
    els.formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    announce('Your custom request form is ready.');
  }

  function renderAddOns() {
    els.addons.innerHTML = config.addOns.map(addon => `
      <label class="addon-option">
        <input type="checkbox" value="${escapeAttr(addon.label)}">
        <span>${escapeHtml(addon.label)}</span>
      </label>`).join('');
  }

  function collectDynamicDetails() {
    const result = {};
    document.querySelectorAll('.detail-input').forEach(input => {
      const value = input.value.trim();
      if (!value) return;
      const serviceId = input.dataset.service;
      const service = byId.get(serviceId);
      if (!result[serviceId]) result[serviceId] = { service: service ? service.title : serviceId, answers: {} };
      result[serviceId].answers[input.dataset.label || input.dataset.field] = value;
    });
    return result;
  }

  function prepareSubmission(event) {
    if (!state.selected.size) {
      event.preventDefault();
      announce('Please choose at least one service before submitting.');
      document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const details = collectDynamicDetails();
    const addOns = [...els.addons.querySelectorAll('input:checked')].map(input => input.value);
    els.detailsHidden.value = JSON.stringify(details);
    els.addOnsHidden.value = addOns.join(' | ');
    els.selectedHidden.value = [...state.selected].map(id => byId.get(id)?.title || id).join(' | ');
    announce('Submitting your request to HBLE…');
  }

  function clearSelection() {
    state.selected.clear();
    renderServices();
    updateSelectionSummary();
    els.dynamic.innerHTML = '';
    els.formSection.hidden = true;
    announce('Selection cleared.');
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
  }

  function escapeAttr(value) { return escapeHtml(value); }

  renderFilters();
  renderServices();
  renderAddOns();
  updateSelectionSummary();

  els.continue.addEventListener('click', openRequest);
  els.clear.addEventListener('click', clearSelection);
  els.form.addEventListener('submit', prepareSubmission);
  els.startButton.addEventListener('click', () => document.getElementById('services').scrollIntoView({ behavior:'smooth' }));
})();
