// === GLOBALE VARIABLEN & HILFSFUNKTIONEN ===
const params = new URLSearchParams(window.location.search);
function getTreatmentModes() {
  const urlMode = params.get('mode');
  const storedMode = sessionStorage.getItem('kombiMode');
  if (urlMode) return urlMode.split(',');
  if (storedMode) return storedMode.split(',');
  return [];
}

const modes = getTreatmentModes();
const active01 = modes.includes('01');
const activeFuellung = modes.includes('fuellung');
const activeEx = modes.includes('ex');
const activeWkb = modes.includes('wkb');
const activeSchiene = modes.includes('schiene');
const activeCerec = modes.includes('cerec');
const activeImplantate = modes.includes('implantate') || modes.includes('impl');
const activeProthetik = modes.includes('prothetik');
const forceAdult = activeCerec || activeSchiene || activeImplantate || activeProthetik;

const analyzeBtn = document.getElementById('analyzeBtn');
const docWrap = document.getElementById('docWrap');
const editor = document.getElementById('editor');
const toggleBtn = document.getElementById('toggleBtn');
const copyAllBtn = document.getElementById('copyAllBtn');

function applyModeUI() {
  if (active01) document.getElementById('box_01').style.display = 'block';
  if (activeFuellung) document.getElementById('box_fuellung').style.display = 'block';
  if (activeEx) document.getElementById('box_ex').style.display = 'block';
  if (activeWkb) document.getElementById('box_wkb').style.display = 'block';
  if (activeSchiene) document.getElementById('box_schiene').style.display = 'block';
  if (activeCerec) document.getElementById('box_cerec').style.display = 'block';
  if (activeImplantate) document.getElementById('box_implantate').style.display = 'block';
  if (activeProthetik) document.getElementById('box_prothetik').style.display = 'block';
  if (forceAdult) document.getElementById('global_child_section').style.display = 'none';

  const titles = [];
  if(active01) titles.push('01/FU');
  if(activeFuellung) titles.push('Füllung');
  if(activeEx) titles.push('Extraktion');
  if(activeWkb) titles.push('WKB');
  if(activeSchiene) titles.push('Schiene');
  if(activeCerec) titles.push('Cerec');
  if(activeImplantate) titles.push('Implantat');
  if(activeProthetik) titles.push('Prothetik');

  document.title = titles.length === 1 ? titles[0] : 'Kombi-Dokumentation';
  document.getElementById('pageTitle').textContent = titles.length === 1 ? `${titles[0]}-Dokumentation` : 'Kombi-Dokumentation';
  document.getElementById('pageSubtitle').textContent = titles.length === 1 ? 'Einzelbehandlung' : titles.join(' + ');
}

function getVal(name) { const el = document.querySelector(`input[name="${name}"]:checked`); return el ? el.value : ''; }
function getValT(name, tSafe) { const el = document.querySelector(`input[name="${name}_${tSafe}"]:checked`); return el ? el.value : ''; }
function isChildGlobal() { return forceAdult ? 'Nein' : getVal('isChild_global'); }

function checkRadio(name, value) {
  const el = document.querySelector(`input[name="${name}"][value="${value}"]`);
  if (el) el.checked = true;
}

function checkCheckbox(name, value) {
  const el = document.querySelector(`input[name="${name}"][value="${value}"]`);
  if (el) el.checked = true;
}

function applyChild01Defaults() {
  if (getVal('isChild_global') !== 'Ja') return;
  checkRadio('untersuchung_01', '01');
  checkRadio('zunge_01', 'nicht eingeschränkt');
  checkRadio('baender_01', 'keine');
  checkRadio('kfo_01', 'o.p.B.');
}

function applyRoentgen01Defaults() {
  if (getVal('roentgen_01') === 'Ja' && document.querySelectorAll('input[name="roentgenType_01"]:checked').length === 0) {
    checkCheckbox('roentgenType_01', 'Einzelzahnaufnahme');
  }
}

function applyDefaultSelections() {
  checkRadio('beschwerden_global', 'Nein');
  if (!forceAdult) checkRadio('isChild_global', 'Nein');
  if (active01) {
    checkRadio('neupatient_01', 'Nein');
    checkRadio('roentgen_01', 'Nein');
    checkRadio('psi_01', 'Nein');
    checkRadio('pzr_01', 'Ja');
    checkRadio('pa_01', 'Nein');
    checkRadio('zst_01', 'Nein');
    applyRoentgen01Defaults();
    applyChild01Defaults();
  }
}
function isMultiRooted(t) { t=parseInt(t,10); if(!t)return false; let q=Math.floor(t/10), d=t%10; return (d>=6&&d<=8) || ((q===1||q===2)&&d===4); }
function parseTeeth(str) { return str.split(',').map(s=>s.trim()).filter(Boolean); }
function hasUpperPosterior(t) { const num = parseInt(t, 10);
  return ((num >= 14 && num <= 18) || (num >= 24 && num <= 28));
}

function getJawFromTeeth(str) {
  if (!str) return '';
  let hasOK = false, hasUK = false;
  const matches = str.match(/\d{2}/g);
  if (matches) {
      matches.forEach(num => {
          const firstDigit = num.charAt(0);
          if (['1', '2', '5', '6'].includes(firstDigit)) hasOK = true;
          if (['3', '4', '7', '8'].includes(firstDigit)) hasUK = true;
      });
  }
  if (hasOK && hasUK) return 'OK/UK';
  if (hasOK) return 'OK';
  if (hasUK) return 'UK';
  return '';
}

function getTotuName(kiefer) {
  if (kiefer === 'OK') return 'TO';
  if (kiefer === 'UK') return 'TU';
  return 'TO/TU';
}

function formatCurrency(inputEl) {
  if (!inputEl) return;
  let val = inputEl.value.trim();
  if (!val) return;
  inputEl.value = val.split(',').map(p => p.trim()).filter(Boolean).map(p => {
    let d = p.replace(/\D/g, ''); return d ? `${Number(d).toLocaleString('de-DE')} €` : p;
  }).join(', ');
  updateAllUI();
}

function syncToothBlocks(containerId, sourceTooth, targetTeeth) {
    const sSafe = sourceTooth.replace(/\W/g, '');
    targetTeeth.forEach(t => {
        const tSafe = t.replace(/\W/g, '');
        document.querySelectorAll(`#${containerId} input[type="radio"][name$="_${sSafe}"], #${containerId} input[type="checkbox"][name$="_${sSafe}"]`).forEach(sRadio => {
            const baseName = sRadio.name.replace(`_${sSafe}`, '');
            const tRadio = document.querySelector(`#${containerId} input[name="${baseName}_${tSafe}"][value="${sRadio.value}"]`);
            if (tRadio) tRadio.checked = sRadio.checked;
        });
        document.querySelectorAll(`#${containerId} input[type="text"][id$="_${sSafe}"], #${containerId} input[type="number"][id$="_${sSafe}"]`).forEach(sText => {
            const baseId = sText.id.replace(`_${sSafe}`, '');
            const tText = document.querySelector(`#${containerId} #${baseId}_${tSafe}`);
            if (tText && !tText.disabled) tText.value = sText.value;
        });
    });
    updateAllUI();
}

function updateBlocks(containerId, templateId, teethArray) {
    const container = document.getElementById(containerId);
    const template = document.getElementById(templateId);
    
    Array.from(container.children).forEach(block => {
        if (block.classList.contains('global-sync-btn')) return;
        const t = block.dataset.tooth; const type = block.dataset.extype;
        if (!teethArray.some(x => typeof x === 'string' ? x === t : (x.t === t && x.type === type))) block.remove();
    });
    
    const existingTeethCombo = Array.from(container.children).filter(c => c.dataset.tooth).map(c => c.dataset.extype ? `${c.dataset.tooth}-${c.dataset.extype}` : c.dataset.tooth);

    teethArray.forEach(item => {
        const t = typeof item === 'string' ? item : item.t;
        const type = typeof item === 'string' ? '' : item.type;
        const comboId = type ? `${t}-${type}` : t;
        
        if (!existingTeethCombo.includes(comboId)) {
            const block = document.createElement('div');
            block.className = 'tooth-block section full';
            block.dataset.tooth = t;
            if (type) block.dataset.extype = type;
            
            const title = document.createElement('div');
            title.className = 'question-title';
            title.style.fontSize = '18px'; title.style.color = 'var(--accent)'; title.style.marginBottom = '12px';
            title.innerText = type === 'Brücke' ? `Therapie Brücke Regio ${t}` : (type ? `Therapie Zahn ${t} (${type})` : `Therapie Zahn ${t}`);
            block.appendChild(title);
            
            const clone = template.content.cloneNode(true);
            const tSafe = type ? `${t.replace(/\W/g, '')}_${type.substring(0,3)}` : t.replace(/\W/g, '');
            
            clone.querySelectorAll('[id]').forEach(el => el.id = el.id + '_' + tSafe);
            clone.querySelectorAll('[name]').forEach(el => el.name = el.name + '_' + tSafe);
            clone.querySelectorAll('[for]').forEach(el => el.htmlFor = el.htmlFor + '_' + tSafe);
            clone.querySelectorAll('input').forEach(inp => {
                inp.addEventListener('input', updateAllUI); inp.addEventListener('change', updateAllUI);
                if(inp.id.startsWith('mkvPrice')) inp.addEventListener('blur', () => formatCurrency(inp));
            });
            
            if (templateId === 'tpl_fuellung') {
                clone.querySelectorAll(`input[name="mkv_f_${tSafe}"]`).forEach(r => r.addEventListener('change', (e) => {
                    if (e.target.value === 'Ja') { const maj = document.querySelector(`input[name="material_f_${tSafe}"][value="Majesty Clearfill"]`); if (maj && !maj.checked) maj.checked = true; }
                    updateAllUI();
                }));
                clone.querySelectorAll(`input[name="aufbau_f_${tSafe}"]`).forEach(r => r.addEventListener('change', (e) => {
                    if (e.target.value === 'Ja') {
                        const bf = document.querySelector(`input[name="material_f_${tSafe}"][value="Bulk Fill"]`);
                        const bff = document.querySelector(`input[name="material_f_${tSafe}"][value="Bulk Fill Flow"]`);
                        if (bf && !bf.checked) bf.checked = true; if (bff && !bff.checked) bff.checked = true;
                    }
                    updateAllUI();
                }));
                clone.querySelectorAll(`input[name="material_f_${tSafe}"]`).forEach(inp => inp.addEventListener('change', () => {
                    const chk = document.querySelector(`input[name="material_f_${tSafe}"][value="Sonstiges"]`);
                    const txt = document.getElementById(`materialOtherText_f_${tSafe}`);
                    if (txt && chk) txt.disabled = !chk.checked;
                    updateAllUI();
                }));
            }
            if (templateId === 'tpl_ex' && type === 'Osteotomie') {
                const nahtJa = clone.querySelector(`input[name="naht_ex_${tSafe}"][value="Ja"]`); if (nahtJa) nahtJa.checked = true;
            }
            if (templateId === 'tpl_cerec') {
                // Wenn TryIn-Paste-Farbe gewählt wird und Befestigung bereits Variolink Esthetik ist,
                // Farbe automatisch übernehmen.
                clone.querySelectorAll(`input[name="tryin_type_c_${tSafe}"]`).forEach(r => r.addEventListener('change', (e) => {
                    if (!e.target.checked) return;
                    const bef = document.querySelector(`input[name="befestigung_c_${tSafe}"]:checked`);
                    if (bef && bef.value === 'Variolink Esthetik') {
                        const varioColor = document.querySelector(`input[name="variolink_c_${tSafe}"][value="${e.target.value}"]`);
                        if (varioColor && !varioColor.checked) varioColor.checked = true;
                    }
                    updateAllUI();
                }));
                // Wenn Befestigung auf Variolink Esthetik gesetzt wird und TryIn-Paste bereits eine
                // Farbe hat, Farbe übernehmen. In jedem Fall Variolink-Farbauswahl sofort einblenden.
                clone.querySelectorAll(`input[name="befestigung_c_${tSafe}"]`).forEach(r => r.addEventListener('change', (e) => {
                    const opts = document.getElementById(`variolinkOptions_c_${tSafe}`);
                    if (opts) opts.classList.toggle('show', e.target.value === 'Variolink Esthetik' && e.target.checked);
                    if (e.target.checked && e.target.value === 'Variolink Esthetik') {
                        const tryinSel = document.querySelector(`input[name="tryin_type_c_${tSafe}"]:checked`);
                        const varioSel = document.querySelector(`input[name="variolink_c_${tSafe}"]:checked`);
                        if (tryinSel && !varioSel) {
                            const varioColor = document.querySelector(`input[name="variolink_c_${tSafe}"][value="${tryinSel.value}"]`);
                            if (varioColor) varioColor.checked = true;
                        }
                    }
                    updateAllUI();
                }));
            }
            block.appendChild(clone);
            container.appendChild(block);
        }
    });
    
    let syncBtn = container.querySelector('.global-sync-btn');
    if (teethArray.length > 1 && !teethArray.some(x => x.type === 'Brücke')) {
        if (!syncBtn) {
            syncBtn = document.createElement('button');
            syncBtn.className = 'toggle-btn global-sync-btn'; syncBtn.type = 'button'; syncBtn.innerText = 'Für andere Zähne auch übernehmen';
            syncBtn.style.marginTop = '12px'; syncBtn.style.width = '100%';
            const firstBlock = container.querySelector('.tooth-block'); if (firstBlock) firstBlock.appendChild(syncBtn);
        }
        syncBtn.onclick = () => {
            const firstItem = teethArray[0];
            const sSafe = typeof firstItem === 'string' ? firstItem : `${firstItem.t}_${firstItem.type.substring(0,3)}`;
            const targets = teethArray.slice(1).map(x => typeof x === 'string' ? x : `${x.t}_${x.type.substring(0,3)}`);
            syncToothBlocks(containerId, sSafe, targets);
        };
    } else if (syncBtn) { syncBtn.remove(); }
}

function checkGlobalReady() {
  document.getElementById('global_childOptions').classList.toggle('show', getVal('isChild_global') === 'Ja');
  document.getElementById('global_beschwerdenOptions').classList.toggle('show', getVal('beschwerden_global') === 'Ja');
  if (!forceAdult && getVal('isChild_global') === 'Ja' && !document.getElementById('erziehungsberechtigter_global').value.trim()) return false;
  if (getVal('beschwerden_global') === 'Ja' && !document.getElementById('beschwerdenText_global').value.trim()) return false;
  if (!getVal('author_global') || !getVal('beschwerden_global')) return false;
  return true;
}

// === ZUSAMMENFUEHRUNG & BUILD ===
function updateAllUI() {
  const rGlobal = checkGlobalReady();
  const r01 = active01 ? check01Ready() : true;
  const rF = activeFuellung ? checkFuellungReady() : true;
  const rEx = activeEx ? checkExReady() : true;
  const rWkb = activeWkb ? checkWkbReady() : true;
  const rSchiene = activeSchiene ? checkSchieneReady() : true;
  const rCerec = activeCerec ? checkCerecReady() : true;
  const rImpl = activeImplantate ? checkImplantateReady() : true;
  
  updateProthetikUI();
  toggleZeBrueckeScanUI();
  const rProthetik = activeProthetik ? checkProthetikReady() : true;
  
  analyzeBtn.disabled = !(rGlobal && r01 && rF && rEx && rWkb && rSchiene && rCerec && rImpl && rProthetik);
}

function buildCombinedText() {
  try {
      const activeBlocks = [];

      if (active01) activeBlocks.push(get01Data());
      if (activeSchiene) activeBlocks.push(getSchieneData());
      if (activeImplantate) activeBlocks.push(getImplantateData());
      if (activeCerec) activeBlocks.push(getCerecData());
      if (activeFuellung) activeBlocks.push(getFuellungData());
      if (activeEx) activeBlocks.push(getExData());
      if (activeWkb) activeBlocks.push(getWkbData());
      if (activeProthetik) activeBlocks.push(getProthetikData());

      const isChild = isChildGlobal();
      const hasBeschwerden = getVal('beschwerden_global');
      const beschwerdenText = document.getElementById('beschwerdenText_global').value.trim();
      const erziehungsberechtigter = document.getElementById('erziehungsberechtigter_global')?.value.trim();

      const allReasons = activeBlocks.map(b => b.reason).filter(Boolean);
      let reasonSentence = "";
      if (allReasons.length === 1) reasonSentence = `Pat. kommt ${allReasons[0]}`;
      else if (allReasons.length > 1) { const last = allReasons.pop(); reasonSentence = `Pat. kommt ${allReasons.join(', ')} und ${last}`; }

      if (activeBlocks.some(b => b.isNeupatient === true)) reasonSentence = `Pat kommt zum 1. Mal in die Praxis<br>${reasonSentence}`;

      let complaintSentence = hasBeschwerden === 'Ja' ? `Pat. hat Beschwerden (${beschwerdenText})` : `Pat. hat keine Beschwerden`;
      let befundHtml = `${reasonSentence}<br>${complaintSentence}`;
      
      if (isChild === 'Ja' && erziehungsberechtigter) befundHtml += `<br>Pat. erscheint in Begleitung (${erziehungsberechtigter})`;

      const allBefundDetails = activeBlocks.flatMap(b => b.otherBefund).filter(Boolean);
      if (allBefundDetails.length > 0) befundHtml += `<br><br>${allBefundDetails.join('<br>')}`;

      const todayHtml = [
        ...activeBlocks.flatMap(b => b.todayLines || []).filter(Boolean),
        ...activeBlocks.flatMap(b => b.todayLinesTrailing || []).filter(Boolean)
      ].join('<br>');

      const manualNext1 = document.getElementById('global_next1').value.trim();
      const manualNext2 = document.getElementById('global_next2').value.trim();
      const autoNextList = activeBlocks.flatMap(b => b.autoNext).filter(Boolean);
      
      const finalNext = [];
      if (manualNext1 || manualNext2) {
        if (manualNext1) finalNext.push(manualNext1);
        if (manualNext2) finalNext.push(manualNext2);
      } else {
        autoNextList.forEach(item => { if(!finalNext.includes(item)) finalNext.push(item); });
      }

      const nextHtml = finalNext.map((n, i) => `${i + 1}. ${n}`).join('<br>');
      const author = getVal('author_global');
      let initialen = author === 'Max Mustermann' ? 'MM' : (author === 'Maria Musterfrau' ? 'MF' : '');

      editor.innerHTML = 
"<strong>Befund:</strong><br>" +
befundHtml + "<br><br>" +
"<strong>Heute durchgeführt:</strong><br>" +
todayHtml + "<br><br>" +
"<strong>Therapie/Next:</strong><br>" +
nextHtml + "<br><br>" +
"Pat. ausführlich erläutert + einverst.<br><br>" +
initialen;

      docWrap.classList.add('show');
      toggleBtn.textContent = 'Textblock ausblenden';
      const status = document.getElementById('status-build');
      status.classList.add('show');
      setTimeout(() => status.classList.remove('show'), 1500);

  } catch(err) { alert("Fehler bei der Texterstellung: " + err.message); console.error(err); }
}


// === EVENT LISTENER BINDINGS ===
document.querySelectorAll('input[name="author_global"]').forEach(r => {
  r.addEventListener('change', (e) => {
     const imgMax = document.getElementById('img_max');
     const imgMaria = document.getElementById('img_maria');
     if (imgMax) imgMax.style.display = e.target.value === 'Max Mustermann' ? 'inline-block' : 'none';
     if (imgMaria) imgMaria.style.display = e.target.value === 'Maria Musterfrau' ? 'inline-block' : 'none';
  });
});

document.querySelectorAll('input[name="mainType_impl"]').forEach(r => {
  r.addEventListener('change', () => {
    document.getElementById('teethContainer_impl').innerHTML = '';
    document.getElementById('generateFormsBtn_impl').style.display = 'block';
    if(r.value === 'ze') {
      document.getElementById('zeLaborSection_impl').style.display = 'block';
      document.getElementById('regioSection_impl').style.display = 'none';
      document.querySelectorAll('input[name="labor_impl"]').forEach(lr => lr.checked = false);
      document.getElementById('zeOptionsContainer_impl').classList.remove('show');
      document.getElementById('zeFremdlaborOptions_impl').style.display = 'none';
    } else {
      document.getElementById('zeLaborSection_impl').style.display = 'none';
      document.getElementById('regioSection_impl').style.display = 'block';
    }
    updateAllUI();
  });
});

document.addEventListener('change', (e) => {
  if (e.target.name === 'mainType_impl') {
    document.getElementById('teethContainer_impl').innerHTML = '';
    if(e.target.value === 'ze') {
      document.getElementById('zeLaborSection_impl').style.display = 'block';
      document.querySelectorAll('input[name="labor_impl"]').forEach(lr => lr.checked = false);
      document.getElementById('zeOptionsContainer_impl').classList.remove('show');
      document.getElementById('zeFremdlaborOptions_impl').style.display = 'none';
    } else {
      document.getElementById('zeLaborSection_impl').style.display = 'none';
    }
  }
  
  if (e.target.name === 'ze_methode_impl') {
    document.getElementById('impl_abformung_wrapper').style.display = e.target.value === 'Scan' ? 'none' : 'grid';
    updateAllUI();
  }
  
  if (e.target.name === 'labor_impl') {
    document.getElementById('teethContainer_impl').innerHTML = '';
    if(e.target.value === 'Fremdlabor') {
      document.getElementById('zeOptionsContainer_impl').classList.remove('show');
      document.getElementById('zeFremdlaborOptions_impl').style.display = 'block';
    } else {
      document.getElementById('zeOptionsContainer_impl').classList.add('show');
      document.getElementById('zeFremdlaborOptions_impl').style.display = 'none';
    }
    toggleZeBrueckeScanUI();
  }

  if (['mainType_impl', 'labor_impl', 'zeVersorgung_impl', 'zeArt_impl', 'zeBrueckeScan_impl'].includes(e.target.name)) {
    document.getElementById('regioSection_impl').style.display = document.querySelector('input[name="mainType_impl"]:checked')?.value === 'ze' && !document.querySelector('input[name="labor_impl"]:checked') ? 'none' : 'block';
    if (['zeVersorgung_impl', 'zeArt_impl', 'zeBrueckeScan_impl'].includes(e.target.name)) document.getElementById('teethContainer_impl').innerHTML = '';
    toggleImplRegioUI();
    toggleZeBrueckeScanUI();
    updateAllUI();
  }
});

if(document.getElementById('generateFormsBtn_impl')) document.getElementById('generateFormsBtn_impl').addEventListener('click', generateImplForms);
if(document.getElementById('generateFormsBtn_impl_kombi')) document.getElementById('generateFormsBtn_impl_kombi').addEventListener('click', generateImplForms);

analyzeBtn.addEventListener('click', () => {
  buildCombinedText();
});

toggleBtn.addEventListener('click', () => {
  const isShown = docWrap.classList.contains('show');
  docWrap.classList.toggle('show', !isShown);
  toggleBtn.textContent = isShown ? 'Textblock anzeigen' : 'Textblock ausblenden';
});

copyAllBtn.addEventListener('click', () => {
  if (editor.innerText.includes('Bitte füllen Sie')) return alert('Bitte zuerst auf „Dokumentation generieren“ klicken.');
  const textarea = document.createElement('textarea');
  textarea.value = editor.innerText;
  document.body.appendChild(textarea);
  textarea.select(); document.execCommand('copy'); document.body.removeChild(textarea);
  const status = document.getElementById('status-all');
  status.classList.add('show');
  setTimeout(() => status.classList.remove('show'), 1600);
});

// === INITIALIZATION ===
applyDefaultSelections();
applyModeUI();
updateAllUI();

document.querySelectorAll('input[name="isChild_global"]').forEach(r => {
  r.addEventListener('change', () => { applyChild01Defaults(); updateAllUI(); });
});
document.querySelectorAll('input[name="roentgen_01"]').forEach(r => {
  r.addEventListener('change', () => { applyRoentgen01Defaults(); updateAllUI(); });
});

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const debouncedUpdateAllUI = debounce(updateAllUI, 300);

document.querySelectorAll('input, select').forEach(el => {
  if(el.type === 'text' || el.type === 'number') {
    el.addEventListener('input', debouncedUpdateAllUI);
  } else {
    el.addEventListener('change', updateAllUI);
  }
});