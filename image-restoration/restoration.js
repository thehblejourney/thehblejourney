(function(){
  const cfg = window.HBLERestorationConfig;
  if(!cfg) return;

  const tierGrid = document.getElementById('tierGrid');
  const addOnGrid = document.getElementById('addOnGrid');
  const files = document.getElementById('photos');
  const fileSummary = document.getElementById('fileSummary');
  const estimateValue = document.getElementById('estimateValue');
  const estimateNote = document.getElementById('estimateNote');
  const form = document.getElementById('restorationForm');
  const tierField = document.getElementById('restoration_level');
  const estimateField = document.getElementById('estimated_price');
  const countField = document.getElementById('photo_count');
  const addOnField = document.getElementById('selected_addons');

  let selectedTier = cfg.tiers[0].id;

  function money(value){
    return new Intl.NumberFormat('en-US',{style:'currency',currency:cfg.currency,maximumFractionDigits:0}).format(value);
  }

  function renderTiers(){
    tierGrid.innerHTML = cfg.tiers.map((tier,index)=>`
      <label class="tier-card ${index===0?'is-selected':''}" data-tier-card="${tier.id}">
        <input type="radio" name="tier_ui" value="${tier.id}" ${index===0?'checked':''}>
        <div class="tier-name">${tier.name}</div>
        <div class="tier-price">${tier.priceLabel}</div>
        <div class="muted">${tier.description}</div>
        <ul>${tier.includes.map(item=>`<li>${item}</li>`).join('')}</ul>
      </label>`).join('');

    tierGrid.querySelectorAll('input[name="tier_ui"]').forEach(input=>{
      input.addEventListener('change',()=>{
        selectedTier=input.value;
        tierGrid.querySelectorAll('.tier-card').forEach(card=>card.classList.toggle('is-selected',card.dataset.tierCard===selectedTier));
        updateEstimate();
      });
    });
  }

  function renderAddOns(){
    addOnGrid.innerHTML = cfg.addOns.map(addon=>`
      <label class="addon">
        <input type="checkbox" value="${addon.id}" data-addon>
        <span><strong>${addon.name}</strong><br><small class="muted">${addon.label}</small></span>
      </label>`).join('');
    addOnGrid.querySelectorAll('[data-addon]').forEach(box=>box.addEventListener('change',updateEstimate));
  }

  function selectedAddOns(){
    return [...addOnGrid.querySelectorAll('[data-addon]:checked')].map(box=>cfg.addOns.find(a=>a.id===box.value)).filter(Boolean);
  }

  function updateFileSummary(){
    const list=[...files.files];
    if(!list.length){
      fileSummary.textContent=`Upload up to ${cfg.maxFiles} photos. JPG, PNG and other common image formats are accepted.`;
      updateEstimate();
      return;
    }
    const names=list.slice(0,5).map(f=>f.name).join(', ');
    const more=list.length>5?` + ${list.length-5} more`:'';
    fileSummary.textContent=`${list.length} photo${list.length===1?'':'s'} selected: ${names}${more}`;
    updateEstimate();
  }

  function updateEstimate(){
    const count=files.files.length;
    const tier=cfg.tiers.find(t=>t.id===selectedTier)||cfg.tiers[0];
    let unit=tier.price;
    let promoApplied=false;
    if(cfg.promo && cfg.promo.enabled && tier.id===cfg.promo.tierId && count>=cfg.promo.minimumPhotos){
      unit=cfg.promo.price;
      promoApplied=true;
    }
    let total=count*unit;
    const addons=selectedAddOns();
    addons.forEach(addon=>{ total += addon.perPhoto ? addon.price*count : addon.price; });

    estimateValue.textContent=count?money(total):'$0';
    let note=count?`${count} photo${count===1?'':'s'} • ${tier.name}`:'Upload photos to calculate your starting estimate.';
    if(tier.startingPrice && count) note+=' • Heavy restoration is reviewed before final pricing.';
    if(promoApplied) note+=` • ${cfg.promo.label} applied.`;
    estimateNote.textContent=note;

    tierField.value=tier.name;
    estimateField.value=count?`${money(total)}${tier.startingPrice?' starting estimate':''}`:'';
    countField.value=String(count);
    addOnField.value=addons.map(a=>a.name).join(', ');
  }

  files.addEventListener('change',()=>{
    if(files.files.length>cfg.maxFiles){
      files.value='';
      fileSummary.textContent=`Please upload no more than ${cfg.maxFiles} photos in one request.`;
    }
    updateFileSummary();
  });

  form.addEventListener('submit',event=>{
    if(!files.files.length){
      event.preventDefault();
      files.focus();
      fileSummary.textContent='Please upload at least one photo before submitting.';
      return;
    }
    if(files.files.length>cfg.maxFiles){
      event.preventDefault();
      fileSummary.textContent=`Please upload no more than ${cfg.maxFiles} photos in one request.`;
      return;
    }
    updateEstimate();
  });

  renderTiers();
  renderAddOns();
  updateFileSummary();
})();
