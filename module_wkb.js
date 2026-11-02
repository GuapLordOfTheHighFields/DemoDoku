// Karte "Ultraschall verwendet?" für die Schritte Med und WF in die Zahn-Vorlage einfügen.
// Läuft beim Laden (vor main.js); die Karte wird danach für jeden Zahn mitkopiert.
(function addUltraschallCard_wkb() {
  const tpl = document.getElementById('tpl_wkb');
  if (!tpl || tpl.content.getElementById('card-ultraschall_wkb')) return;
  const card = document.createElement('div');
  card.id = 'card-ultraschall_wkb';
  card.className = 'question-card wkb-card';
  card.innerHTML = `<div class="question-title">Ultraschall verwendet?</div><div class="yn"><label class="pill"><input type="radio" name="ultraschall_wkb" value="Ja"> Ja</label><label class="pill"><input type="radio" name="ultraschall_wkb" value="Nein"> Nein</label></div>`;
  const mkvCard = tpl.content.getElementById('card-mkv_wkb');
  if (mkvCard) mkvCard.insertAdjacentElement('afterend', card);
  else tpl.content.querySelector('.question-grid')?.appendChild(card);
})();

function checkWkbReady() {
  const teeth = parseTeeth(document.getElementById('toothNumber_wkb').value);
  updateBlocks('dyn_wkb', 'tpl_wkb', teeth);
  document.getElementById('therapieSection_wkb').style.display = teeth.length > 0 ? 'block' : 'none';
  if (teeth.length === 0) return false;
  let allValid = true;
  teeth.forEach(t => {
    const s = t.replace(/\W/g, '');
    const stepVal = getValT('therapieschritt_wkb', s);
    const art = getValT('wkbart_wkb', s);
    const verf = getValT('verfahren_wkb', s);

    document.querySelectorAll(`#dyn_wkb .tooth-block[data-tooth="${t}"] .wkb-card`).forEach(c => c.style.display = 'none');
    if (stepVal === 'WKB') {
      ['card-wkbart_wkb','card-diagnose_wkb','card-mkv_wkb','card-anaesthesie_wkb','card-kofferdam_wkb','card-praeendo_wkb','card-verfahren_wkb','card-kanaele_wkb'].forEach(id => { const el=document.getElementById(`${id}_${s}`); if(el) el.style.display = 'block'; });
      if (art === 'Revision') {
          const elVipr = document.getElementById(`card-vipr_wkb_${s}`); if(elVipr) elVipr.style.display = 'none';
          const trep = document.querySelector(`input[name="verfahren_wkb_${s}"][value="Trep"]`);
          if (trep && !trep.checked) { trep.checked = true; setTimeout(updateAllUI, 0); return; }
      } else {
          const elVipr = document.getElementById(`card-vipr_wkb_${s}`); if(elVipr) elVipr.style.display = 'block';
      }
      if (verf === 'VitE') {
          const el = document.getElementById(`card-wf_mitgemacht_wkb_${s}`); if (el) el.style.display = 'block';
          if (getValT('wfMitgemacht_wkb', s) === 'Ja') { ['card-wf_wkb','card-sealer_wkb'].forEach(id => { const c=document.getElementById(`${id}_${s}`); if(c) c.style.display = 'block'; }); }
          else { const m = document.getElementById(`card-med_wkb_${s}`); if (m) m.style.display = 'block'; }
      } else { const m = document.getElementById(`card-med_wkb_${s}`); if (m) m.style.display = 'block'; }
    }
    // Bei Med/WF nur fragen, ob Ultraschall verwendet wurde (statt Mehrkostenvereinbarung)
    else if (stepVal === 'Med') { ['card-anaesthesie_wkb','card-kofferdam_wkb','card-ultraschall_wkb','card-med_wkb'].forEach(id => { const el=document.getElementById(`${id}_${s}`); if(el) el.style.display = 'block'; }); }
    else if (stepVal === 'WF') { ['card-anaesthesie_wkb','card-kofferdam_wkb','card-ultraschall_wkb','card-sealer_wkb','card-wf_wkb'].forEach(id => { const el=document.getElementById(`${id}_${s}`); if(el) el.style.display = 'block'; }); }

    const otherText = document.getElementById(`otherText_wkb_${s}`);
    if(document.getElementById(`radioOther_wkb_${s}`)) { otherText.disabled = !document.getElementById(`radioOther_wkb_${s}`).checked; }
    const medOtherText = document.getElementById(`medOtherText_wkb_${s}`);
    if(document.getElementById(`radioMedOther_wkb_${s}`)) { medOtherText.disabled = !document.getElementById(`radioMedOther_wkb_${s}`).checked; }
    const sealerOtherText = document.getElementById(`sealerOtherText_wkb_${s}`);
    if(document.getElementById(`radioSealerOther_wkb_${s}`)) { sealerOtherText.disabled = !document.getElementById(`radioSealerOther_wkb_${s}`).checked; }

    document.getElementById(`anaesthesieOptions_wkb_${s}`)?.classList.toggle('show', getValT('anaesthesie_wkb', s) === 'Ja');
    document.getElementById(`mkvOptions_wkb_${s}`)?.classList.toggle('show', getValT('mkv_wkb', s) === 'Ja');
    document.getElementById(`viprOptions_wkb_${s}`)?.classList.toggle('show', getValT('vipr_wkb', s) === 'Ja');

    const wrap = document.getElementById(`kanalTexteWrap_wkb_${s}`);
    const countInput = document.getElementById(`kanalauswahl_wkb_${s}`);
    if(wrap && countInput) {
        let count = parseInt(countInput.value || '', 10); if (isNaN(count) || count < 0) count = 0;
        const currentLines = wrap.querySelectorAll('.kanal-line').length;
        if (count !== currentLines) {
            if (count > currentLines) {
                for (let i = currentLines + 1; i <= count; i++) {
                    const row = document.createElement('div'); row.className = 'kanal-line';
                    row.innerHTML = `<strong>Kanal ${i}</strong><input type="text" class="mini-input" placeholder="Text"><span>: elAL=</span><input type="text" class="mini-input" placeholder="xx"><span>mm mit ISO</span><input type="text" class="mini-input" placeholder="xx"><span>RF:</span><input type="text" class="mini-input" placeholder="z.B. HS">`;
                    row.querySelectorAll('input').forEach(inp => inp.addEventListener('input', updateAllUI));
                    wrap.appendChild(row);
                }
            } else { for (let i = currentLines; i > count; i--) { if (wrap.lastElementChild) wrap.removeChild(wrap.lastElementChild); } }
        }
    }

    if(stepVal === '') { allValid = false; return; }
    if(stepVal === 'WKB') {
        if(!art || !getValT('diagnose_wkb', s) || !getValT('kofferdam_wkb', s) || !getValT('mkv_wkb', s) || !getValT('praeEndo_wkb', s) || !getValT('verfahren_wkb', s)) allValid = false;
        if(getValT('anaesthesie_wkb', s) === 'Ja' && document.querySelectorAll(`input[name="anaeType_wkb_${s}"]:checked`).length === 0) allValid = false;
        if(art !== 'Revision' && getValT('vipr_wkb', s) === 'Ja' && !getValT('viprResult_wkb', s)) allValid = false;
        if(!countInput || !countInput.value.trim() || isNaN(Number(countInput.value.trim())) || Number(countInput.value.trim()) <= 0) allValid = false;
        if(!getValT('roeMessaufnahme_wkb', s)) allValid = false;
        if(verf === 'VitE' && getValT('wfMitgemacht_wkb', s) === 'Ja') {
            if(!getValT('wf_wkb', s) || !getValT('sealer_wkb', s)) allValid = false;
        } else {
            if(!getValT('med_wkb', s)) allValid = false;
        }
    }
    if(stepVal === 'Med' && (!getValT('anaesthesie_wkb', s) || !getValT('kofferdam_wkb', s) || !getValT('ultraschall_wkb', s) || !getValT('med_wkb', s))) allValid = false;
    if(stepVal === 'WF' && (!getValT('anaesthesie_wkb', s) || !getValT('kofferdam_wkb', s) || !getValT('ultraschall_wkb', s) || !getValT('wf_wkb', s) || !getValT('sealer_wkb', s))) allValid = false;
  });
  return allValid;
}

function getWkbData() {
  const teeth = parseTeeth(document.getElementById('toothNumber_wkb').value.trim());
  const tData = teeth.map(t => {
      const s = t.replace(/\W/g, '');
      return {
          t, s, step: getValT('therapieschritt_wkb', s), art: getValT('wkbart_wkb', s),
          vipr: getValT('vipr_wkb', s), viprRes: getValT('viprResult_wkb', s),
          diag: getValT('diagnose_wkb', s) === 'Sonstiges' ? document.getElementById(`otherText_wkb_${s}`).value.trim() : getValT('diagnose_wkb', s),
          anae: getValT('anaesthesie_wkb', s), anaeType: Array.from(document.querySelectorAll(`input[name="anaeType_wkb_${s}"]:checked`)).map(c => c.value),
          kofferdam: getValT('kofferdam_wkb', s), mkv: getValT('mkv_wkb', s), mkvPrice: document.getElementById(`mkvPrice_wkb_${s}`)?.value.trim(),
          ultraschall: getValT('ultraschall_wkb', s),
          prae: getValT('praeEndo_wkb', s), verf: getValT('verfahren_wkb', s), wfMitgemacht: getValT('wfMitgemacht_wkb', s),
          med: getValT('med_wkb', s) === 'Sonstiges' ? document.getElementById(`medOtherText_wkb_${s}`).value.trim() : getValT('med_wkb', s),
          sealer: getValT('sealer_wkb', s) === 'Sonstiges' ? document.getElementById(`sealerOtherText_wkb_${s}`).value.trim() : getValT('sealer_wkb', s),
          wf: getValT('wf_wkb', s), kanaele: document.getElementById(`kanalauswahl_wkb_${s}`)?.value.trim(), roe: getValT('roeMessaufnahme_wkb', s)
      };
  });

  const reason = ['WKB', 'Med', 'WF'].map(step => {
     const stepTeeth = tData.filter(d => d.step === step);
     if (!stepTeeth.length) return null;
     if (step === 'WKB') {
         let r = [];
         const rev = stepTeeth.filter(d => d.art === 'Revision').map(d => d.t);
         const wkb = stepTeeth.filter(d => d.art === 'WKB').map(d => d.t);
         if (rev.length) r.push(`zur Revision an ${rev.length > 1 ? 'den Zähnen' : 'Zahn'} ${rev.join(', ')}`);
         if (wkb.length) r.push(`zur WKB an ${wkb.length > 1 ? 'den Zähnen' : 'Zahn'} ${wkb.join(', ')}`);
         return r.join(' und ');
     }
     return `${step === 'Med' ? 'zum Medikamentenwechsel' : 'zur Wurzelfüllung'} an ${stepTeeth.length > 1 ? 'den Zähnen' : 'Zahn'} ${stepTeeth.map(d=>d.t).join(', ')}`;
  }).filter(Boolean).join(' und ');

  const otherBefund = []; const todayLines = []; const autoNext = [];

  ['WKB', 'Med', 'WF'].forEach(currentStep => {
      const stepTeeth = tData.filter(d => d.step === currentStep);
      if (stepTeeth.length === 0) return;
      const tsStr = stepTeeth.map(d => d.t).join(', ');

      if (currentStep === 'WKB') {
          stepTeeth.forEach(d => { if (d.art === 'WKB' && d.vipr === 'Ja') todayLines.push(`${d.t} ViPr ${d.viprRes} (Eisspray)`); });
          stepTeeth.forEach(d => otherBefund.push(`Diagnose (${d.t}): ${d.diag}`));
          const anaeTeeth = stepTeeth.filter(d=>d.anae==='Ja');
          if(anaeTeeth.length>0) todayLines.push(`Aufklärung Anästhesie (${anaeTeeth.map(d=>d.t).join(', ')}) → Pat. willigt ein`);
          todayLines.push(`Aufklärung WKB (${tsStr}) → Pat. willigt ein`);
          stepTeeth.filter(d=>d.mkv==='Ja').forEach(d => todayLines.push(`Aufklärung Mehrkostenvereinbarung (${d.t}) → Pat. willigt ein (${d.mkvPrice})`));
          anaeTeeth.forEach(d => todayLines.push(`Anästhesie ${d.t} ${d.anaeType.join(' / ')} 1:200.000`));
          const kofferTeeth = stepTeeth.filter(d=>d.kofferdam==='Ja').map(d=>d.t);
          if(kofferTeeth.length > 0) todayLines.push(`${kofferTeeth.join(', ')} Kofferdam gelegt`);

          stepTeeth.forEach(d => {
              if (d.prae === 'Ja') todayLines.push(`${d.t} Kariesexkavation und Präendo-Aufbau mit Matrize und Bulk Fill`);
              const vitKanalWort = Number(d.kanaele) === 1 ? 'Kanal' : 'Kanäle';
              todayLines.push(d.verf === 'Trep' ? `${d.t} Trepanation des Zahnes` : `${d.t} Vitalexstirpation d. ${vitKanalWort}`);
              if (d.kanaele) todayLines.push(`${d.t}: ${d.kanaele} ${Number(d.kanaele) === 1 ? 'Wurzelkanal' : 'Wurzelkanäle'} aufbereitet`);
              todayLines.push(`Spülung d. Kanäle (${d.t}) mit NaOCL${d.mkv === 'Ja' ? ' + Ultraschall' : ''}`);
              if (d.roe === 'Ja') todayLines.push(`${d.t} Meßaufnahme mit Referenzkörper`);

              if (Number(d.kanaele) > 0) {
                  todayLines.push(`${d.t} Längenmessung mit Endometrie, Längen:`);
                  const wrap = document.getElementById(`kanalTexteWrap_wkb_${d.s}`);
                  if(wrap) {
                      Array.from(wrap.querySelectorAll('.kanal-line')).forEach(row => {
                          const inputs = row.querySelectorAll('input');
                          todayLines.push(`  - ${inputs[0]?.value.trim() || 'xx'}: elAL=${inputs[1]?.value.trim() || 'xx'}mm mit ISO${inputs[2]?.value.trim() || 'xx'} RF: ${inputs[3]?.value.trim() || 'xx'}`);
                      });
                  }
              }
              todayLines.push(`Trocknung der Kanäle (${d.t}) mit Papierspitzen`);

              if (d.verf === 'VitE' && d.wfMitgemacht === 'Ja') {
                  todayLines.push(`Abfüllen der Kanäle (${d.t}) mit ${d.wf} + Sealer (${d.sealer})`);
                  todayLines.push(`Röntgenkontrollaufnahme nach Einbringen der WF (${d.t})`);
                  todayLines.push(`Kavität nach WF mit Harvard-UF + Bonding + Flow/Bulk Fill verschlossen (${d.t})`);
                  autoNext.push('Röntgenkontrolle');
              } else {
                  todayLines.push(`Einlage einer medikamentösen Einlage ${d.med} in ${d.t}`);
                  todayLines.push(`${d.t} mit Cavit+Watte prov. verschlossen`);
                  autoNext.push('Med');
              }
          });

      } else if (currentStep === 'Med') {
          stepTeeth.filter(d=>d.anae==='Ja').forEach(d => todayLines.push(`Anästhesie ${d.t} ${d.anaeType.join(' / ')} 1:200.000`));
          const kofferTeeth = stepTeeth.filter(d=>d.kofferdam==='Ja').map(d=>d.t);
          if(kofferTeeth.length > 0) todayLines.push(`${kofferTeeth.join(', ')} Kofferdam gelegt`);

          todayLines.push(`Entfernen d. prov. Verschlusses (${tsStr})`);
          stepTeeth.forEach(d => {
              todayLines.push(`Spülung d. Med aus den WK (${d.t}) mit NaOCL${d.ultraschall === 'Ja' ? ' + Ultraschall' : ''}`);
              todayLines.push(`Trocknung der Kanäle (${d.t}) mit Papierspitzen`);
              todayLines.push(`Einlage einer medikamentösen Einlage ${d.med} in ${d.t}`);
              todayLines.push(`${d.t} mit Cavit+Watte prov. verschlossen`);
          });
          autoNext.push('WF');

      } else if (currentStep === 'WF') {
          stepTeeth.filter(d=>d.anae==='Ja').forEach(d => todayLines.push(`Anästhesie ${d.t} ${d.anaeType.join(' / ')} 1:200.000`));
          const kofferTeeth = stepTeeth.filter(d=>d.kofferdam==='Ja').map(d=>d.t);
          if(kofferTeeth.length > 0) todayLines.push(`${kofferTeeth.join(', ')} Kofferdam gelegt`);

          todayLines.push(`Entfernen d. prov. Verschlusses (${tsStr})`);
          stepTeeth.forEach(d => {
              todayLines.push(`${d.t} Wurzelkanäle aufbereitet`);
              todayLines.push(`Spülung d. Kanäle (${d.t}) mit NaOCL${d.ultraschall === 'Ja' ? ' + Ultraschall' : ''}`);
              todayLines.push(`Trocknung der Kanäle (${d.t}) mit Papierspitzen`);
              todayLines.push(`Abfüllen der Kanäle (${d.t}) mit ${d.wf} + Sealer (${d.sealer})`);
              todayLines.push(`Röntgenkontrollaufnahme nach Einbringen der WF (${d.t})`);
              todayLines.push(`Kavität nach WF mit Harvard-UF + Bonding + Flow/Bulk Fill verschlossen (${d.t})`);
          });
          autoNext.push('Röntgenkontrolle');
      }
  });
  return { reason, otherBefund, todayLines, autoNext };
}
