(function(){
  const cfg = window.HBLERestorationConfig;
  if(!cfg) return;

  const tierGrid = document.getElementById('tierGrid');
  const addOnGrid = document.getElementById('addOnGrid');
  const photoInputs = Array.from(document.querySelectorAll('[data-restoration-photo]'));
  const referenceInput = document.getElementById('reference');
  const allowedTypes = ['image/jpeg','image/png','image/webp'];
  const maxUploadBytes = cfg.maxUploadMB * 1024 * 1024;
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

  function selectedPhotos(){
    return photoInputs.reduce((all,input)=>all.concat(Array.from(input.files||[])),[]);
  }

  function checkUploads(){
    const photos=selectedPhotos();
    const reference=referenceInput && referenceInput.files.length?referenceInput.files[0]:null;
    const all=reference?photos.concat(reference):photos;
    const invalid=all.find(file=>!(/\.(jpe?g|png|webp)$/i.test(file.name)) || (file.type && !allowedTypes.includes(file.type)));
    const totalBytes=all.reduce((sum,file)=>sum+file.size,0);
    const totalMB=(totalBytes/(1024*1024)).toFixed(1);
    let error='';
    if(photos.length>cfg.maxFiles) error='Please select at most '+cfg.maxFiles+' restoration photos.';
    else if(invalid) error='Only JPG, PNG, and WebP images are permitted. Check: '+invalid.name;
    else if(totalBytes>maxUploadBytes) error='Your files total '+totalMB+' MB. The combined upload limit is '+cfg.maxUploadMB+' MB, including the optional reference photo.';
    return {photos,reference,error,totalMB};
  }

  function updateFileSummary(){
    const result=checkUploads();
    if(result.error){
      fileSummary.textContent=result.error;
      fileSummary.style.color='#ffb7a5';
    }else{
      fileSummary.style.color='';
      const count=result.photos.length;
      fileSummary.textContent=count
        ?count+' photo'+(count===1?'':'s')+' selected ('+result.totalMB+' MB total including any reference). You can submit up to '+cfg.maxFiles+' images per request.'
        :'Select 1–'+cfg.maxFiles+' JPG, PNG or WebP photos. Maximum '+cfg.maxUploadMB+' MB combined, including any reference image.';
    }
    updateEstimate();
  }

  function updateEstimate(){
    const count=selectedPhotos().length;
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

  photoInputs.forEach(input=>input.addEventListener('change',updateFileSummary));
  if(referenceInput)referenceInput.addEventListener('change',updateFileSummary);

  form.addEventListener('submit',event=>{
    const result=checkUploads();
    if(!result.photos.length || result.error){
      event.preventDefault();
      fileSummary.textContent=result.error||'Please choose at least one photo before submitting.';
      fileSummary.style.color='#ffb7a5';
      fileSummary.scrollIntoView({behavior:'smooth',block:'center'});
      return;
    }
    updateEstimate();
  });

  renderTiers();
  renderAddOns();
  updateFileSummary();
})();
