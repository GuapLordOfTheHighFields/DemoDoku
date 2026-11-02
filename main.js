// === GLOBALE VARIABLEN & HILFSFUNKTIONEN ===
// Demoversion: ohne Statistik-Übertragung, nur 01/FU, Füllung, Extraktion und WKB freigeschaltet
const APP_VERSION = 'Demoversion';
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

// === BEHANDLER (zentral pflegen) ===
// name: Anzeige · kuerzel: steht am Ende des Textes · bild: optionale Bilddatei (in der Demo keine)
const BEHANDLER = [
  { name: 'Max Mustermann',   kuerzel: 'MM', bild: '' },
  { name: 'Maria Musterfrau', kuerzel: 'MF', bild: '' }
];

// Baut die Auswahl "Dokumentation durch" samt Bildern aus der Liste oben auf
function renderBehandler() {
  const section = document.getElementById('authorSection');
  if (!section) return;
  const yn = section.querySelector('.yn');
  if (yn) {
    yn.innerHTML = '';
    BEHANDLER.forEach(b => {
      const label = document.createElement('label');
      label.className = 'pill';
      const inp = document.createElement('input');
      inp.type = 'radio'; inp.name = 'author_global'; inp.value = b.name;
      label.append(inp, ' ' + b.name);
      yn.appendChild(label);
    });
  }
  const oldImg = section.querySelector('img');
  const imgWrap = oldImg ? oldImg.parentElement : null;
  if (imgWrap) {
    imgWrap.innerHTML = '';
    BEHANDLER.forEach((b, i) => {
      if (!b.bild) return;
      const img = document.createElement('img');
      img.id = `img_behandler_${i}`;
      img.alt = b.name;
      img.style.cssText = 'display:none; max-height:150px; border-radius:12px;';
      img.onerror = () => { img.dataset.broken = '1'; img.style.display = 'none'; };
      img.src = b.bild;
      imgWrap.appendChild(img);
    });
  }
}
function showBehandlerBild(name) {
  BEHANDLER.forEach((b, i) => {
    const img = document.getElementById(`img_behandler_${i}`);
    if (img) img.style.display = (b.name === name && !img.dataset.broken) ? 'inline-block' : 'none';
  });
}
function getBehandlerKuerzel(name) { return (BEHANDLER.find(b => b.name === name) || {}).kuerzel || ''; }
renderBehandler();

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
  const versionTag = document.querySelector('.version-tag');
  if (versionTag) versionTag.textContent = APP_VERSION;
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
// Trennt Zahnangaben an Komma, Semikolon oder Leerzeichen ("14, 15", "14 15", "14;15").
// Brücken-Spannen bleiben zusammen ("14-16" und "14 - 16" -> "14-16"), doppelte Angaben werden entfernt.
// Füllwörter ohne Ziffern (z. B. "und") werden ignoriert.
function parseTeeth(str) {
  const list = String(str || '').replace(/\s*[-–]\s*/g, '-').split(/[\s,;]+/).map(s => s.trim()).filter(s => /\d/.test(s));
  return [...new Set(list)];
}

// FDI-Prüfung: bleibende Zähne 11–48, Milchzähne 51–85
function isValidFdi(t) {
  if (!/^\d{2}$/.test(t)) return false;
  const q = Number(t[0]), d = Number(t[1]);
  if (q >= 1 && q <= 4) return d >= 1 && d <= 8;
  if (q >= 5 && q <= 8) return d >= 1 && d <= 5;
  return false;
}
function getInvalidTeeth(str) {
  return [...new Set(parseTeeth(str).flatMap(x => x.split('-')).filter(Boolean).filter(t => !isValidFdi(t)))];
}

// Eingabefelder mit Zahnnummern; ungültige Angaben werden direkt unter dem Feld angezeigt
const TOOTH_INPUT_IDS = ['toothNumber_f', 'toothNumber_wkb', 'toothNumber_ex', 'toothNumber_ex_ext', 'toothNumber_ex_ost',
  'toothNumber_c', 'toothNumber_c_krone', 'toothNumber_c_teilkrone', 'toothNumber_c_bruecke',
  'toothInput_impl', 'impl_k_zahn', 'impl_b_zahn',
  'zahn_p', 'praep_single_zahn_p', 'praep_k_zahn_p', 'praep_tk_zahn_p', 'praep_b_zahn_p', 'stiftZahn_p', 'ekr_zaehne_p'];

// Liefert die Zahnfelder mit ungültigen Nummern (leer = alles in Ordnung)
function validateToothInputs() {
  const badFields = [];
  TOOTH_INPUT_IDS.forEach(id => {
    const inp = document.getElementById(id);
    if (!inp) return;
    let hint = document.getElementById(`${id}_hint`);
    const visible = inp.offsetParent !== null;
    const bad = visible ? getInvalidTeeth(inp.value) : [];
    if (bad.length > 0) {
      badFields.push({ label: `Ungültige Zahnnummer ${bad.join(', ')}`, el: inp });
      if (!hint) {
        hint = document.createElement('div');
        hint.id = `${id}_hint`;
        hint.style.cssText = 'color:#b91c1c; font-size:13px; margin-top:6px;';
        // Bei Feldern in einer Zeile mit Button den Hinweis unter die ganze Zeile setzen
        const anchor = inp.parentElement && inp.parentElement.id === 'impl_regio_single' ? inp.parentElement : inp;
        anchor.insertAdjacentElement('afterend', hint);
      }
      hint.textContent = `Ungültige Zahnnummer: ${bad.join(', ')}`;
      hint.style.display = 'block';
    } else if (hint) {
      hint.style.display = 'none';
    }
  });
  return badFields;
}
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

// Module, die selbst einen Vorschlag für "Therapie/Next" liefern. Sind nur andere Module aktiv,
// muss "Weiteres Vorgehen 1" ausgefüllt werden, sonst bliebe der Abschnitt leer.
const providesAutoNext = activeEx || activeWkb || activeSchiene || activeImplantate;

// Liefert die Liste der noch offenen allgemeinen Angaben (leer = alles ausgefüllt)
function getGlobalMissing() {
  document.getElementById('global_childOptions').classList.toggle('show', getVal('isChild_global') === 'Ja');
  document.getElementById('global_beschwerdenOptions').classList.toggle('show', getVal('beschwerden_global') === 'Ja');
  const missing = [];
  const add = (label, el) => missing.push({ label, el });
  if (!forceAdult && getVal('isChild_global') === 'Ja' && !document.getElementById('erziehungsberechtigter_global').value.trim()) add('Begleitperson', document.getElementById('erziehungsberechtigter_global'));
  if (!getVal('beschwerden_global')) add('Beschwerden', document.querySelector('input[name="beschwerden_global"]'));
  else if (getVal('beschwerden_global') === 'Ja' && !document.getElementById('beschwerdenText_global').value.trim()) add('Details zu den Beschwerden', document.getElementById('beschwerdenText_global'));
  if (!providesAutoNext && !document.getElementById('global_next1').value.trim()) add('Weiteres Vorgehen (Next 1)', document.getElementById('global_next1'));
  if (!getVal('author_global')) add('Dokumentation durch', document.getElementById('authorSection'));
  return missing;
}
function checkGlobalReady() { return getGlobalMissing().length === 0; }

// === OFFENE FRAGEN ERMITTELN ===
// Felder, die sichtbar sein dürfen, ohne beantwortet zu sein (Name bzw. ID ohne Zahn-Endung)
const OPTIONAL_FIELDS = ['therapieSonstiges_01', 'global_next2',
  'mkv_f', 'vipr_f', 'anaesthesie_f', 'bmf_f', 'aufbau_f', 'cpp_f',
  'vipr_wkb', 'wfMitgemacht_wkb', 'mkvPrice_wkb',
  'anaesthesie_c', 'retraktion_c',
  'ubi100', 'ubi200',
  'auflagen_p', 'stiftKanal_p'];

// Zahnfelder, bei denen nur mindestens eines ausgefüllt sein muss
const TEXT_GROUPS = {
  praep_kombi_wrap_p: 'Art der Präparation – Zähne (Krone / Teilkrone / Brücke)',
  teethKombi_c: 'Zähne (Krone / Teilkrone / Brücke)',
  teethKombi_ex: 'Zähne (Extraktion / Osteotomie)',
  impl_regio_kombi: 'Regio (Krone / Brücke)'
};

function isFieldShown(el) { return el.offsetParent !== null; }

function isOptionalField(el, key) {
  if (el.classList.contains('mini-input')) return true;
  if (OPTIONAL_FIELDS.some(b => key === b || key.startsWith(b + '_'))) return true;
  // WKB: Anästhesie ist nur bei Med und WF Pflicht
  if (key.startsWith('anaesthesie_wkb_')) {
    const step = el.closest('.tooth-block')?.querySelector('input[name^="therapieschritt_wkb_"]:checked')?.value;
    return step === 'WKB';
  }
  return false;
}

function cleanLabelText(s) { return String(s || '').replace(/\s*\([^)]*\)/g, '').replace(/\s*[–-]\s*falls.*$/i, '').replace(/[:\s]+$/, '').replace(/\s+/g, ' ').trim(); }

// Liefert den lesbaren Namen der Frage, zu der ein Eingabefeld gehört
function getFieldLabel(el) {
  const card = el.closest('.question-card') || el.closest('.section');
  const titleEl = card ? card.querySelector('.question-title, .label') : null;
  const title = titleEl ? cleanLabelText(titleEl.textContent) : '';
  const isChoice = el.type === 'radio' || el.type === 'checkbox';
  let detail = '';

  // Unterfrage innerhalb aufklappbarer Optionen (z. B. "Stift-Art", "Rö-Messaufnahme");
  // Textfelder dort werden über ihren Platzhalter benannt (z. B. "ISO-Größe", "Preis")
  const sub = el.closest('.sub-options');
  if (sub && card && card.contains(sub)) {
    if (!isChoice && el.placeholder) detail = cleanLabelText(el.placeholder);
    if (!detail) {
      const inner = Array.from(sub.querySelectorAll('.question-title, .label-row span'))
        .filter(t => t.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING).pop();
      detail = inner ? cleanLabelText(inner.textContent) : (isChoice ? 'Auswahl' : '');
    }
  }
  // Zwischenüberschrift direkt an der Auswahl (z. B. "Gewinde geschnitten?", "Periostschlitzung?")
  if (!detail && isChoice) {
    const grp = el.closest('.yn, .choice-group');
    const own = grp ? Array.from(grp.children).find(c => c.tagName === 'LABEL' && !c.classList.contains('pill') && !c.classList.contains('choice')) : null;
    const prev = grp ? grp.previousElementSibling : null;
    const prevOk = prev && prev !== titleEl && !prev.querySelector('input') && prev.textContent.trim();
    if (own) detail = cleanLabelText(own.textContent);
    else if (prevOk) detail = cleanLabelText(prev.textContent);
  }
  // Textfeld in einer Karte mit mehreren Eingaben: Platzhalter als Zusatz
  if (!detail && !isChoice && card && card.querySelectorAll('input:not(.mini-input)').length > 1) detail = cleanLabelText(el.placeholder);
  if (!title && !detail && !isChoice) detail = cleanLabelText(el.placeholder);

  let label = title && detail && detail !== title ? `${title} – ${detail}` : (title || detail || 'Angabe');
  const block = el.closest('.tooth-block, .tooth-card');
  if (block && block.dataset.tooth) {
    const prefix = block.classList.contains('tooth-card') ? 'Regio' : (block.dataset.extype === 'Brücke' ? 'Brücke' : 'Zahn');
    label = `${prefix} ${block.dataset.tooth}: ${label}`;
  }
  return label;
}

// Sucht in einem Modul alle sichtbaren, noch nicht beantworteten Pflichtfragen
function findMissingFields(box) {
  const out = [];
  const seen = new Set();
  const groupIds = Object.keys(TEXT_GROUPS);
  // Reihenfolge wie auf dem Bildschirm (Prothetik ordnet manche Karten per CSS "order" um)
  const add = (label, el) => out.push({ label, el, ord: Number(el.closest('.question-card')?.style.order) || 0, idx: out.length });
  box.querySelectorAll('input').forEach(el => {
    if (el.disabled || !isFieldShown(el)) return;
    const key = el.name || el.id;
    if (!key || seen.has(key)) return;
    seen.add(key);
    if (isOptionalField(el, key)) return;
    if (groupIds.some(g => el.closest('#' + g))) return;
    if (el.type === 'radio' || el.type === 'checkbox') {
      const anyChecked = Array.from(box.querySelectorAll('input')).some(i => i.name === key && i.checked);
      if (!anyChecked) add(getFieldLabel(el), el);
    } else if (el.type === 'text' || el.type === 'number') {
      if (!el.value.trim()) add(getFieldLabel(el), el);
    }
  });
  groupIds.forEach(g => {
    const wrap = box.querySelector('#' + g);
    if (!wrap || !isFieldShown(wrap)) return;
    if (Array.from(wrap.querySelectorAll('input')).every(i => !i.value.trim())) add(TEXT_GROUPS[g], wrap);
  });
  out.sort((a, b) => (a.ord - b.ord) || (a.idx - b.idx));
  const seenLabels = new Set();
  return out.filter(o => !seenLabels.has(o.label) && seenLabels.add(o.label)).map(o => ({ label: o.label, el: o.el }));
}

// Eine Gruppe pro Modul, z. B. "Prothetik: Approximalkontakt?, Randschluss suffizient?"
function describeModuleMissing(name, boxId) {
  const box = document.getElementById(boxId);
  const items = box ? findMissingFields(box) : [];
  const implHint = boxId === 'box_implantate' ? document.getElementById('implFormsHint') : null;
  if (implHint && implHint.style.display !== 'none' && implHint.textContent) {
    const btn = document.getElementById('impl_regio_kombi')?.offsetParent ? document.getElementById('generateFormsBtn_impl_kombi') : document.getElementById('generateFormsBtn_impl');
    items.push({ label: implHint.textContent, el: btn || implHint });
  }
  return { name, items, el: box };
}

// Hinweis unter dem Button "Dokumentation generieren", was noch fehlt.
// Jeder Eintrag ist anklickbar: springt zur Frage und hebt sie kurz farbig hervor.
function ensureMissingStyles() {
  if (document.getElementById('missingHintStyles')) return;
  const st = document.createElement('style');
  st.id = 'missingHintStyles';
  st.textContent = '.missing-link{color:var(--accent,#2563eb);text-decoration:underline;cursor:pointer;}'
    + '.missing-link:hover{text-decoration:none;}'
    + '.missing-highlight{outline:3px solid #f59e0b !important;outline-offset:4px;border-radius:14px;transition:outline-color .4s ease;}';
  document.head.appendChild(st);
}

function jumpToField(el) {
  if (!el) return;
  const target = el.closest('.question-card') || el.closest('.section') || el;
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  target.classList.add('missing-highlight');
  setTimeout(() => target.classList.remove('missing-highlight'), 2200);
  if (el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'number')) setTimeout(() => el.focus({ preventScroll: true }), 400);
}

function makeMissingLink(text, el) {
  const a = document.createElement('a');
  a.href = '#';
  a.className = 'missing-link';
  a.textContent = text;
  a.addEventListener('click', (e) => { e.preventDefault(); jumpToField(el); });
  return a;
}

function showMissingHint(groups) {
  ensureMissingStyles();
  let hint = document.getElementById('missingHint');
  if (!hint) {
    hint = document.createElement('div');
    hint.id = 'missingHint';
    hint.style.cssText = 'color:var(--muted, #64748b); font-size:13px; line-height:1.6; margin:-6px 0 14px;';
    const bar = analyzeBtn.closest('.bar') || analyzeBtn;
    bar.insertAdjacentElement('afterend', hint);
  }
  hint.textContent = '';
  hint.style.display = groups.length > 0 ? 'block' : 'none';
  if (groups.length === 0) return;
  const head = document.createElement('div');
  head.textContent = 'Noch offen (anklicken springt zur Frage):';
  hint.appendChild(head);
  groups.forEach(g => {
    const line = document.createElement('div');
    line.append('• ');
    if (g.items.length === 0) {
      line.appendChild(makeMissingLink(g.name, g.el));
    } else {
      line.append(`${g.name}: `);
      g.items.forEach((it, i) => { if (i > 0) line.append(', '); line.appendChild(makeMissingLink(it.label, it.el)); });
    }
    hint.appendChild(line);
  });
}

// === ZUSAMMENFUEHRUNG & BUILD ===
function updateAllUI() {
  const missing = [];
  const globalMissing = getGlobalMissing();
  if (globalMissing.length > 0) missing.push({ name: 'Allgemein', items: globalMissing, el: document.getElementById('box_global') });
  if (active01 && !check01Ready()) missing.push(describeModuleMissing('01/FU', 'box_01'));
  if (activeFuellung && !checkFuellungReady()) missing.push(describeModuleMissing('Füllung', 'box_fuellung'));
  if (activeEx && !checkExReady()) missing.push(describeModuleMissing('Extraktion', 'box_ex'));
  if (activeWkb && !checkWkbReady()) missing.push(describeModuleMissing('WKB', 'box_wkb'));
  if (activeSchiene && !checkSchieneReady()) missing.push(describeModuleMissing('Schiene', 'box_schiene'));
  if (activeCerec && !checkCerecReady()) missing.push(describeModuleMissing('Cerec', 'box_cerec'));
  if (activeImplantate && !checkImplantateReady()) missing.push(describeModuleMissing('Implantate', 'box_implantate'));

  updateProthetikUI();
  toggleZeBrueckeScanUI();
  if (activeProthetik && !checkProthetikReady()) missing.push(describeModuleMissing('Prothetik', 'box_prothetik'));

  // Erst nach den Modulen prüfen, weil diese die Sichtbarkeit der Zahnfelder setzen
  const badTeeth = validateToothInputs();
  if (badTeeth.length > 0) missing.push({ name: 'Zahnnummern', items: badTeeth, el: badTeeth[0].el });

  analyzeBtn.disabled = missing.length > 0;
  showMissingHint(missing);
}

// Nutzereingaben im Textblock unschädlich machen; nur die vom Programm selbst
// verwendeten Formatierungen (<br>, <strong>, &rarr;) bleiben erhalten.
function sanitizeDocHtml(html) {
  return String(html)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/&lt;(\/?)(br|strong)&gt;/g, '<$1$2>')
    .replace(/&amp;rarr;/g, '&rarr;');
}

// Erkennt, ob ein Modul den Aufklärungs-/Einverständnis-Satz schon enthält
const CONSENT_SENTENCE_RE = /ausführlich (aufgeklärt|erläutert) (\+|und) einverst/i;

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

      if (activeBlocks.some(b => b.isNeupatient === true)) reasonSentence = `Pat. kommt zum 1. Mal in die Praxis<br>${reasonSentence}`;

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
      let initialen = getBehandlerKuerzel(author);

      // Schlusssatz nur ergänzen, wenn kein Modul ihn schon in "Heute durchgeführt" geschrieben hat
      const closingLine = CONSENT_SENTENCE_RE.test(todayHtml) ? '' : "Pat. ausführlich erläutert + einverst.<br><br>";

      editor.innerHTML = sanitizeDocHtml(
"<strong>Befund:</strong><br>" +
befundHtml + "<br><br>" +
"<strong>Heute durchgeführt:</strong><br>" +
todayHtml + "<br><br>" +
"<strong>Therapie/Next:</strong><br>" +
nextHtml + "<br><br>" +
closingLine +
initialen);

      docWrap.classList.add('show');
      toggleBtn.textContent = 'Textblock ausblenden';
      const status = document.getElementById('status-build');
      status.classList.add('show');
      setTimeout(() => status.classList.remove('show'), 1500);

  } catch(err) { alert("Fehler bei der Texterstellung: " + err.message); console.error(err); }
}

// === EVENT LISTENER BINDINGS ===
document.querySelectorAll('input[name="author_global"]').forEach(r => {
  r.addEventListener('change', (e) => showBehandlerBild(e.target.value));
});

// Behandlungsart Implantate: alles in einem gemeinsamen Listener (Regio-Bereich und
// "Formulare erzeugen"-Button werden unten über toggleImplRegioUI gesetzt)
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

copyAllBtn.addEventListener('click', async () => {
  if (editor.innerText.includes('Bitte füllen Sie')) return alert('Bitte zuerst auf „Dokumentation generieren“ klicken.');
  const text = editor.innerText;
  let copied = false;
  // Moderne Zwischenablage (nur über https/localhost verfügbar), sonst bisheriger Weg als Ersatz
  try {
    if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); copied = true; }
  } catch (e) { copied = false; }
  if (!copied) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select(); document.execCommand('copy'); document.body.removeChild(textarea);
  }
  const status = document.getElementById('status-all');
  status.classList.add('show');
  setTimeout(() => status.classList.remove('show'), 1600);
});

// === NEUER PATIENT ===
// Lädt die Seite mit denselben Behandlungen leer neu. Der gewählte Behandler bleibt erhalten.
function addNewPatientButton() {
  const bar = analyzeBtn.closest('.bar');
  if (!bar || document.getElementById('newPatientBtn')) return;
  const btn = document.createElement('button');
  btn.id = 'newPatientBtn';
  btn.type = 'button';
  btn.className = 'toggle-btn';
  btn.textContent = 'Neuer Patient';
  btn.style.marginTop = '0';
  btn.addEventListener('click', () => {
    if (!confirm('Alle Eingaben verwerfen und mit einem neuen Patienten beginnen?')) return;
    try { sessionStorage.setItem('kombiAuthor', getVal('author_global')); } catch (e) {}
    const m = getTreatmentModes().join(',');
    window.location.href = window.location.pathname + (m ? `?mode=${encodeURIComponent(m)}` : '');
  });
  analyzeBtn.insertAdjacentElement('afterend', btn);
}

function restoreBehandler() {
  let saved = '';
  try { saved = sessionStorage.getItem('kombiAuthor') || ''; } catch (e) {}
  if (!saved) return;
  checkRadio('author_global', saved);
  showBehandlerBild(saved);
}

// === INITIALIZATION ===
applyDefaultSelections();
restoreBehandler();
addNewPatientButton();
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
