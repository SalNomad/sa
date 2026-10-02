(() => {
  'use strict';
  const D = window.MC_DATA;
  const I = window.MC_I18N;
  if (!D || !I) return;

  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const store = {
    get(k, fallback){ try { const v=localStorage.getItem('mc:'+k); return v===null?fallback:JSON.parse(v); } catch { return fallback; } },
    set(k,v){ try { localStorage.setItem('mc:'+k,JSON.stringify(v)); } catch {} },
    del(k){ try { localStorage.removeItem('mc:'+k); } catch {} }
  };

  let lang = store.get('lang', (navigator.language || 'en').split('-')[0]);
  if (!I.languages.some(row => row[0] === lang)) lang='en';
  let journey = store.get('journey','umrah');
  let activeStep = 0;
  let audience='all';
  let placeFilter='all';
  let wellbeingTimer=null;
  let wellbeingSeconds=1200;
  let installPrompt=null;

  const isArabic = () => lang === 'ar';
  const local = (o, en='en', ar='ar') => isArabic() ? (o[ar] || o[en] || '') : (o[en] || o[ar] || '');
  const t = key => I.get(lang,key);
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const announce = msg => { const el=$('#srStatus'); if(el){ el.textContent=''; setTimeout(()=>el.textContent=msg,20); } };

  function populateLanguages(){
    const sel=$('#languageSelect');
    sel.innerHTML='';
    I.languages.forEach(([code,name,dir,status])=>{
      const o=document.createElement('option'); o.value=code;
      const marker = status==='fallback' ? ' · beta' : (status==='core' ? ' · core' : '');
      o.textContent=name+marker; sel.append(o);
    });
    sel.value=lang;
  }

  function translatePage(){
    const meta=I.meta(lang);
    document.documentElement.lang=lang;
    document.documentElement.dir=meta.dir || 'ltr';
    $$('[data-i18n]').forEach(el=>{ const v=t(el.dataset.i18n); if(v) el.textContent=v; });
    $$('[data-i18n-placeholder]').forEach(el=>{ const v=t(el.dataset.i18nPlaceholder); if(v) el.placeholder=v; });
    $('#translationNotice').hidden = (meta.status==='full');
    document.title = isArabic() ? 'بوصلة المناسك — دليل الحج والعمرة' : 'Manasik Compass — Hajj & Umrah Guide | دليل الحج والعمرة';
    renderAll();
  }

  function setLang(code){
    if(!I.languages.some(row => row[0] === code)) return;
    lang=code; store.set('lang',lang); translatePage();
    announce((I.meta(code).name || code)+' selected');
  }

  function renderJourney(){
    const steps=D.journeys[journey];
    const done=store.get('done:'+journey,[]);
    $('#journeyTitle').textContent = journey==='hajj' ? t('hajjJourney') : t('umrahJourney');
    $('#hajjTypePanel').hidden = journey!=='hajj';
    $$('.journey-btn').forEach(b=>{ const on=b.dataset.journey===journey; b.classList.toggle('active',on); b.setAttribute('aria-pressed',String(on)); });
    $('#journeySteps').innerHTML=steps.map((s,i)=>`<button class="journey-step ${i===activeStep?'active':''} ${done.includes(s.id)?'done':''}" data-index="${i}" aria-current="${i===activeStep?'step':'false'}"><span class="step-no">${String(i+1).padStart(2,'0')}</span><b>${esc(local(s))}</b>${done.includes(s.id)?'<span aria-hidden="true"> ✓</span>':''}</button>`).join('');
    const pct=Math.round((done.length/steps.length)*100); $('#journeyProgress').style.width=pct+'%';
    $('#journeyProgress').parentElement.setAttribute('aria-label',`${pct}% ${t('complete')||'complete'}`);
    renderStepDetail();
  }

  function renderStepDetail(){
    const steps=D.journeys[journey], s=steps[Math.min(activeStep,steps.length-1)], done=store.get('done:'+journey,[]), yes=done.includes(s.id);
    const points=isArabic()?s.pointsAr:s.pointsEn;
    const source=s.source||D.ministryGuides;
    $('#stepDetail').innerHTML=`<div class="step-detail-grid"><div class="step-symbol" aria-hidden="true">${esc(s.icon)}</div><div><h3>${esc(local(s))}</h3><p>${esc(isArabic()?s.summaryAr:s.summaryEn)}</p><ul class="step-points">${points.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="source-line">${esc(t('source')||'Source')}: <a href="${esc(source)}" target="_blank" rel="noopener">${source.includes('sunnah.com')?'Hadith reference':'Official / primary source'} ↗</a>${s.extra?` · <a href="${esc(s.extra)}" target="_blank" rel="noopener">Hadith ↗</a>`:''}</div><div class="step-actions"><button class="complete-step" data-step="${esc(s.id)}">${yes?'✓ '+esc(t('reviewedStep')||'Reviewed'):esc(t('markReviewed')||'Mark reviewed')}</button><span class="status-pill">${activeStep+1} / ${steps.length}</span></div></div></div>`;
  }

  function toggleStepDone(id){
    let done=store.get('done:'+journey,[]); done=done.includes(id)?done.filter(x=>x!==id):[...done,id]; store.set('done:'+journey,done); renderJourney();
    announce(done.includes(id)?(t('markedReviewed')||'Marked reviewed'):(t('markedNotReviewed')||'Marked not reviewed'));
  }

  function renderCounters(){ ['tawaf','sai'].forEach(type=>updateCounter(type, store.get('counter:'+type,0), false)); }
  function updateCounter(type,value,persist=true){
    value=Math.max(0,Math.min(7,Number(value)||0)); if(persist) store.set('counter:'+type,value);
    const count=$('#'+type+'Count'), ring=$('#'+type+'Ring'), msg=$('#'+type+'Message'); count.textContent=value; ring.style.setProperty('--p',((value/7)*100)+'%'); ring.setAttribute('aria-valuenow',value);
    const complete = value===7;
    msg.textContent=complete?(t('sevenComplete')||'7 of 7 complete'):(value===0?(t('readyToStart')||'Ready to start'):`${value} / 7`);
    if(persist){ if(navigator.vibrate) navigator.vibrate(complete?[60,80,60]:25); announce(`${type==='tawaf'?t('tawaf'):t('sai')}: ${value} of 7`); }
  }

  function renderAudience(){
    const list=D.audiences.filter(a=>audience==='all'||a.audience===audience||a.audience==='all');
    $('#audienceCards').innerHTML=list.map(a=>`<article class="audience-card"><span class="badge">${esc(isArabic()?a.badgeAr:a.badgeEn)}</span><h3>${esc(isArabic()?a.titleAr:a.titleEn)}</h3><p>${esc(isArabic()?a.textAr:a.textEn)}</p><a href="${esc(a.source)}" target="_blank" rel="noopener">${esc(t('source')||'Source')} ↗</a></article>`).join('');
    $$('.audience-tabs button').forEach(b=>{ const on=b.dataset.audience===audience; b.classList.toggle('active',on); b.setAttribute('aria-selected',String(on)); });
  }

  function renderPhones(){
    const card=p=>`<a class="phone-card" href="tel:${esc(p.number)}"><div class="phone-top"><span class="phone-icon" aria-hidden="true">${esc(p.icon)}</span>${p.priority?'<span class="status-pill">'+esc(t('important')||'Important')+'</span>':''}</div><strong>${esc(p.number)}</strong><span>${esc(isArabic()?p.ar:p.en)}</span><small>${esc(isArabic()?p.noteAr:p.noteEn)}</small></a>`;
    $('#phoneGrid').innerHTML=D.phones.map(card).join('');
    $('#dialogPhones').innerHTML=D.phones.filter(p=>p.priority).map(p=>`<a href="tel:${esc(p.number)}"><span>${esc(isArabic()?p.ar:p.en)}</span><b>${esc(p.number)}</b></a>`).join('');
  }

  function tagLabel(tag){
    const map={worship:isArabic()?'سنة/نسك ثابت':'Rite / established Sunnah',history:isArabic()?'أهمية تاريخية':'Historical significance',caution:isArabic()?'لا فضل خاص مدّعى':'No special visit virtue claimed'}; return map[tag]||tag;
  }
  function placeCity(p){ return p.hajj ? (isArabic()?'مشاعر الحج':'Hajj site') : p.city==='madinah'?(isArabic()?'المدينة':'Madinah'):(isArabic()?'مكة':'Makkah'); }
  function renderPlaces(){
    const q=($('#placeSearch').value||'').trim().toLowerCase();
    const list=D.places.filter(p=>{
      const filter=placeFilter==='all'||(placeFilter==='hajj'?p.hajj:p.city===placeFilter);
      const hay=(p.en+' '+p.ar+' '+p.descEn+' '+p.descAr).toLowerCase(); return filter&&(!q||hay.includes(q));
    });
    $('#placesGrid').innerHTML=list.length?list.map(p=>`<article class="place-card"><div class="place-illustration">${D.illustrations[p.icon]||D.illustrations.mountain}<span class="place-city">${esc(placeCity(p))}</span></div><div class="place-body"><div class="place-tags">${p.tags.map(tag=>`<span class="place-tag ${tag==='history'?'history':tag==='caution'?'caution':''}">${esc(tagLabel(tag))}</span>`).join('')}</div><h3>${esc(local(p))}</h3><p>${esc(isArabic()?p.descAr:p.descEn)}</p><div class="place-evidence"><b>${esc(t('evidence')||'Evidence')}:</b> ${esc(isArabic()?p.evidenceAr:p.evidenceEn)}</div><div class="place-actions"><a href="${esc(p.map)}" target="_blank" rel="noopener">⌖ ${esc(t('openMap')||'Open map')} ↗</a><a href="${esc(p.source)}" target="_blank" rel="noopener">${esc(t('source')||'Source')} ↗</a>${p.source2?`<a href="${esc(p.source2)}" target="_blank" rel="noopener">+ ${esc(t('secondSource')||'Reference')} ↗</a>`:''}</div></div></article>`).join(''):`<p>${esc(t('noPlaces')||'No matching places.')}</p>`;
    $$('.filter-btn').forEach(b=>b.classList.toggle('active',b.dataset.placeFilter===placeFilter));
  }

  function renderSources(){
    $('#sourceGrid').innerHTML=D.sources.map(s=>`<article class="source-card"><span class="status-pill">${esc(s.kind)}</span><b>${esc(s.name)}</b><p>${esc(s.desc)}</p><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(t('openSource')||'Open source')} ↗</a></article>`).join('');
  }

  function renderPilgrimCard(){
    const c=store.get('pilgrimCard',{}); const fields=[['meetingPoint',t('meetingPoint')],['hotelName',t('hotelName')],['groupContact',t('groupContact')],['pilgrimNotes',t('notes')]];
    fields.forEach(([id])=>{ const el=$('#'+id); if(el && document.activeElement!==el) el.value=c[id]||''; });
    const content=fields.filter(([id])=>c[id]).map(([id,label])=>`<div class="preview-line"><small>${esc(label)}</small><b>${esc(c[id])}</b></div>`).join('');
    $('#previewContent').innerHTML=content||`<p>${esc(t('cardEmpty')||'Add your details to create a quick card you can show to staff or your group.')}</p>`;
  }


  function getHijriParts(){
    try{
      const parts=new Intl.DateTimeFormat('en-u-ca-islamic-umalqura',{day:'numeric',month:'numeric',year:'numeric'}).formatToParts(new Date());
      const get=type=>parts.find(p=>p.type===type)?.value;
      return {day:Number(get('day')),month:Number(get('month')),year:Number(get('year'))};
    }catch{return null;}
  }

  function renderHajjToday(){
    const hp=getHijriParts();
    const hijri=$('#hijriDate');
    if(hijri){
      try{hijri.textContent=new Intl.DateTimeFormat(lang+'-u-ca-islamic-umalqura',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());}
      catch{hijri.textContent=hp?`${hp.day}/${hp.month}/${hp.year} AH`:'';}
    }
    const sel=$('#hajjDaySelect');
    const saved=store.get('hajjDay','auto'); if(sel && sel.value!==saved) sel.value=saved;
    let day=saved==='auto' ? ((hp&&hp.month===12&&hp.day>=8&&hp.day<=13)?hp.day:null) : Number(saved);
    const box=$('#hajjTodayCard'); if(!box)return;
    if(!day || !D.hajjDays[day]){
      box.innerHTML=`<div class="day-hero"><div class="day-icon">☾</div><div><h3>${esc(t('outsideHajjDays'))}</h3><p>${esc(t('confirmLiveSchedule'))}</p></div></div>`;
      return;
    }
    const d=D.hajjDays[day], tasks=isArabic()?d.tasksAr:d.tasksEn;
    box.innerHTML=`<div class="day-hero"><div class="day-icon" aria-hidden="true">${esc(d.icon)}</div><div><small>${esc(t('todayPlan'))}</small><h3>${esc(local(d))}</h3><p>${esc(isArabic()?d.leadAr:d.leadEn)}</p></div></div><ul>${tasks.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p class="micro-note"><strong>${esc(t('officialScheduleRule'))}</strong></p>`;
  }

  function renderReadiness(){
    const done=store.get('readiness',[]);
    const box=$('#readinessChecklist'); if(!box)return;
    box.innerHTML=D.readinessChecklist.map(item=>`<label class="readiness-item"><input type="checkbox" data-ready="${esc(item.id)}" ${done.includes(item.id)?'checked':''}><span class="ready-icon" aria-hidden="true">${esc(item.icon)}</span><span class="ready-text">${esc(local(item))}</span></label>`).join('')+`<div class="readiness-progress">${done.length} / ${D.readinessChecklist.length} ${esc(t('checklistProgress'))}</div>`;
  }

  function renderHelpPhrases(){
    const box=$('#helpPhraseGrid'); if(!box)return;
    box.innerHTML=D.helpPhrases.map(p=>`<button class="phrase-card" type="button" data-phrase="${esc(p.id)}"><span class="phrase-icon" aria-hidden="true">${esc(p.icon)}</span><div class="phrase-ar" lang="ar" dir="rtl">${esc(p.ar)}</div><div class="phrase-en">${esc(p.en)}</div><div class="phrase-action">${esc(t('tapToShow'))} →</div></button>`).join('');
  }

  function openPhrase(id){
    const p=D.helpPhrases.find(x=>x.id===id); if(!p)return;
    $('#phraseDialogContent').innerHTML=`<div class="phrase-large"><div class="phrase-symbol" aria-hidden="true">${esc(p.icon)}</div><div class="arabic" lang="ar" dir="rtl">${esc(p.ar)}</div><div class="translation">${esc(p.en)}</div><div class="row"><button type="button" class="btn primary" id="speakPhrase">🔊 ${esc(t('speakArabic'))}</button></div></div>`;
    $('#phraseDialog').showModal();
    $('#speakPhrase').addEventListener('click',()=>{if(!('speechSynthesis' in window))return; speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(p.ar);u.lang='ar-SA';speechSynthesis.speak(u);},{once:false});
  }

  function renderConnection(){
    const el=$('#connectionStatus'); if(!el)return; const on=navigator.onLine;
    el.classList.toggle('online',on);el.classList.toggle('offline',!on);
    const span=el.querySelector('span:last-child'); if(span)span.textContent=on?t('online'):t('offline');
  }

  function renderWellbeingTimer(){
    const out=$('#wellbeingCountdown'); if(!out)return; const m=Math.floor(wellbeingSeconds/60), sec=wellbeingSeconds%60; out.textContent=`${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    const b=$('#wellbeingToggle'); if(b)b.textContent=wellbeingTimer?t('pauseReminder'):t('startReminder');
  }

  function toggleWellbeing(){
    if(wellbeingTimer){clearInterval(wellbeingTimer);wellbeingTimer=null;renderWellbeingTimer();return;}
    if(wellbeingSeconds<=0)wellbeingSeconds=1200;
    wellbeingTimer=setInterval(()=>{wellbeingSeconds--;if(wellbeingSeconds<=0){wellbeingSeconds=1200;announce(t('wellbeingNow'));if(navigator.vibrate)navigator.vibrate([80,80,80]);}renderWellbeingTimer();},1000);
    renderWellbeingTimer();
  }

  function renderPhaseTwo(){renderHajjToday();renderReadiness();renderHelpPhrases();renderConnection();renderWellbeingTimer();}

  function renderAll(){ renderJourney(); renderCounters(); renderAudience(); renderPhones(); renderPlaces(); renderSources(); renderPilgrimCard(); renderPhaseTwo(); }

  function speak(text){
    if(!('speechSynthesis' in window)) { announce(t('speechUnavailable')||'Speech is unavailable in this browser.'); return; }
    speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.lang=lang; speechSynthesis.speak(u);
  }

  function initEvents(){
    $('#languageSelect').addEventListener('change',e=>setLang(e.target.value));
    $$('.journey-btn').forEach(b=>b.addEventListener('click',()=>{journey=b.dataset.journey; activeStep=0; store.set('journey',journey); renderJourney();}));
    $('#journeySteps').addEventListener('click',e=>{const b=e.target.closest('.journey-step'); if(!b)return; activeStep=Number(b.dataset.index); renderJourney(); $('#stepDetail').focus?.();});
    $('#stepDetail').addEventListener('click',e=>{const b=e.target.closest('.complete-step'); if(b)toggleStepDone(b.dataset.step);});
    $('#resetJourney').addEventListener('click',()=>{store.set('done:'+journey,[]);activeStep=0;renderJourney();});
    $('#hajjType').value=store.get('hajjType','tamattu');
    $('#hajjType').addEventListener('change',e=>store.set('hajjType',e.target.value));
    $('#readJourney').addEventListener('click',()=>{const s=D.journeys[journey][activeStep];speak(`${local(s)}. ${isArabic()?s.summaryAr:s.summaryEn}. ${(isArabic()?s.pointsAr:s.pointsEn).join('. ')}`);});

    $$('.counter-plus,.counter-minus,.reset-counter').forEach(b=>b.addEventListener('click',()=>{const type=b.dataset.type; const cur=store.get('counter:'+type,0); updateCounter(type,b.classList.contains('reset-counter')?0:cur+(b.classList.contains('counter-plus')?1:-1));}));
    $$('.audience-tabs button').forEach(b=>b.addEventListener('click',()=>{audience=b.dataset.audience;renderAudience();}));
    $$('.filter-btn').forEach(b=>b.addEventListener('click',()=>{placeFilter=b.dataset.placeFilter;renderPlaces();}));
    $('#placeSearch').addEventListener('input',renderPlaces);
    $('#hajjDaySelect').addEventListener('change',e=>{store.set('hajjDay',e.target.value);renderHajjToday();});
    $('#readinessChecklist').addEventListener('change',e=>{const cb=e.target.closest('[data-ready]');if(!cb)return;let done=store.get('readiness',[]);done=cb.checked?[...new Set([...done,cb.dataset.ready])]:done.filter(x=>x!==cb.dataset.ready);store.set('readiness',done);renderReadiness();});
    $('#resetChecklist').addEventListener('click',()=>{store.del('readiness');renderReadiness();});
    $('#helpPhraseGrid').addEventListener('click',e=>{const b=e.target.closest('[data-phrase]');if(b)openPhrase(b.dataset.phrase);});
    $('#wellbeingToggle').addEventListener('click',toggleWellbeing);
    addEventListener('online',renderConnection);addEventListener('offline',renderConnection);


    $$('[data-scroll]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.scroll)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})));
    $('#menuToggle').addEventListener('click',e=>{const nav=$('#mobileNav'); const open=nav.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',String(open));});
    $$('#mobileNav a').forEach(a=>a.addEventListener('click',()=>{$('#mobileNav').classList.remove('open');$('#menuToggle').setAttribute('aria-expanded','false');}));

    $('#openEmergency').addEventListener('click',()=>$('#emergencyDialog').showModal());
    $('#emergencyMore').addEventListener('click',()=>{$('#emergencyDialog').close();});

    $('#getLocation').addEventListener('click',()=>{
      const out=$('#locationResult'); out.hidden=false;
      if(!navigator.geolocation){out.textContent=t('geoUnavailable')||'Location is unavailable in this browser.';return;}
      out.textContent=t('locating')||'Getting your location…';
      navigator.geolocation.getCurrentPosition(pos=>{
        const lat=pos.coords.latitude.toFixed(6), lon=pos.coords.longitude.toFixed(6), acc=Math.round(pos.coords.accuracy||0);
        const g=`https://www.google.com/maps/search/hospital/@${lat},${lon},15z`;
        out.innerHTML=`<b>${esc(t('yourCoordinates')||'Your coordinates')}</b><br><code>${lat}, ${lon}</code> <small>±${acc} m</small><div class="row" style="margin-top:.5rem"><button class="soft-btn" type="button" id="copyCoords">${esc(t('copy')||'Copy')}</button><a class="btn light" href="${g}" target="_blank" rel="noopener">${esc(t('nearbyHospitals')||'Nearby hospitals')} ↗</a></div>`;
        $('#copyCoords').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(`${lat}, ${lon}`);announce(t('copied')||'Copied');}catch{announce(`${lat}, ${lon}`);}});
      },err=>{out.textContent=(t('geoDenied')||'Location could not be shown. Check browser permission or tell emergency staff your nearest gate/landmark.')+' ('+err.code+')';},{enableHighAccuracy:true,timeout:12000,maximumAge:30000});
    });

    $('#pilgrimForm').addEventListener('submit',e=>{e.preventDefault();const c={meetingPoint:$('#meetingPoint').value.trim(),hotelName:$('#hotelName').value.trim(),groupContact:$('#groupContact').value.trim(),pilgrimNotes:$('#pilgrimNotes').value.trim()};store.set('pilgrimCard',c);renderPilgrimCard();announce(t('cardSaved')||'Card saved on this device.');});
    $('#clearCard').addEventListener('click',()=>{store.del('pilgrimCard');$('#pilgrimForm').reset();renderPilgrimCard();});
    $('#fullScreenCard').addEventListener('click',()=>{const c=store.get('pilgrimCard',{});const rows=[[t('meetingPoint'),c.meetingPoint],[t('hotelName'),c.hotelName],[t('groupContact'),c.groupContact],[t('notes'),c.pilgrimNotes]].filter(x=>x[1]).map(x=>`<p><small>${esc(x[0])}</small><br><strong>${esc(x[1])}</strong></p>`).join('');$('#largeCardContent').innerHTML=`<div class="large-card-display"><h2>${esc(t('myMeetingCard')||'My meeting card')}</h2>${rows||'<p>'+esc(t('cardEmpty')||'No details saved.')+'</p>'}</div>`;$('#largeCardDialog').showModal();});

    $('#fontToggle').addEventListener('click',()=>{const on=!document.documentElement.classList.contains('large-text');document.documentElement.classList.toggle('large-text',on);store.set('largeText',on);});
    $('#contrastToggle').addEventListener('click',e=>{const on=!document.body.classList.contains('high-contrast');document.body.classList.toggle('high-contrast',on);e.currentTarget.setAttribute('aria-pressed',String(on));store.set('contrast',on);});
    const installBtn=$('#installApp');
    addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;installBtn.hidden=false;announce(t('installReady'));});
    installBtn.addEventListener('click',async()=>{if(!installPrompt)return;installPrompt.prompt();try{await installPrompt.userChoice;}catch{}installPrompt=null;installBtn.hidden=true;});
    addEventListener('appinstalled',()=>{installPrompt=null;installBtn.hidden=true;});
    $('#readPage').addEventListener('click',()=>speak($('#accessibility').innerText));
  }

  function initObserver(){
    if(!('IntersectionObserver' in window))return; const links=$$('.side-nav>a');
    const obs=new IntersectionObserver(entries=>{entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio).slice(0,1).forEach(e=>links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id)));},{rootMargin:'-25% 0px -60%',threshold:[0,.25,.6]});
    $$('.section[id]').forEach(s=>obs.observe(s));
  }

  function boot(){
    populateLanguages();
    if(store.get('largeText',false))document.documentElement.classList.add('large-text');
    if(store.get('contrast',false)){document.body.classList.add('high-contrast');$('#contrastToggle').setAttribute('aria-pressed','true');}
    translatePage(); initEvents(); initObserver();
    if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('./sw.js').catch(()=>{});
  }
  document.addEventListener('DOMContentLoaded',boot);
})();
