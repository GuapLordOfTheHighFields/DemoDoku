function checkFuellungReady() {
  const teeth = parseTeeth(document.getElementById('toothNumber_f').value);
  updateBlocks('dyn_fuellung', 'tpl_fuellung', teeth);
  document.getElementById('therapieSection_f').style.display = teeth.length > 0 ? 'block' : 'none';
  if (teeth.length === 0) return false;
  let allValid = true;
  teeth.forEach(t => {
    const s = t.replace(/\W/g, '');
    document.getElementById(`mkvOptions_f_${s}`)?.classList.toggle('show', getValT('mkv_f', s) === 'Ja');
    document.getElementById(`viprOptions_f_${s}`)?.classList.toggle('show', getValT('vipr_f', s) === 'Ja');
    document.getElementById(`anaesthesieOptions_f_${s}`)?.classList.toggle('show', getValT('anaesthesie_f', s) === 'Ja');
    document.getElementById(`bmfOptions_f_${s}`)?.classList.toggle('show', getValT('bmf_f', s) === 'Ja');
    const bmfOtherRadio = document.getElementById(`radioBmfOther_f_${s}`);
    if(bmfOtherRadio) { document.getElementById(`bmfOtherText_f_${s}`).disabled = !bmfOtherRadio.checked; }
    const cppVal = getValT('cpp_f', s);
    document.getElementById(`cppOptions_f_${s}`)?.classList.toggle('show', cppVal === 'CP' || cppVal === 'P');
    const cppOtherRadio = document.getElementById(`radioCppOther_f_${s}`);
    if(cppOtherRadio) { document.getElementById(`cppOtherText_f_${s}`).disabled = !cppOtherRadio.checked; }
    document.getElementById(`aufbauOptions_f_${s}`)?.classList.toggle('show', getValT('aufbau_f', s) === 'Ja');

    if (!document.getElementById(`toothSurfaces_f_${s}`)?.value.trim()) allValid = false;
    if (getValT('mkv_f', s) === 'Ja' && !document.getElementById(`mkvPrice_f_${s}`)?.value.trim()) allValid = false;
    if (getValT('vipr_f', s) === 'Ja' && !getValT('viprResult_f', s)) allValid = false;
    if (getValT('anaesthesie_f', s) === 'Ja' && document.querySelectorAll(`input[name="anaeType_f_${s}"]:checked`).length === 0) allValid = false;
    if (!getValT('matrize_f', s)) allValid = false;
    if (getValT('bmf_f', s) === 'Ja' && (!getValT('bmfType_f', s) || (getValT('bmfType_f', s)==='Sonstiges' && !document.getElementById(`bmfOtherText_f_${s}`)?.value.trim()))) allValid = false;
    if (getValT('aufbau_f', s) === 'Ja' && !getValT('aufbauArt_f', s)) allValid = false;
    if ((cppVal==='CP'||cppVal==='P') && (!getValT('cppMaterial_f', s) || (getValT('cppMaterial_f', s)==='Sonstiges' && !document.getElementById(`cppOtherText_f_${s}`)?.value.trim()))) allValid = false;
    if (!document.getElementById(`zahnfarbe_f_${s}`)?.value.trim()) allValid = false;
    const matSonst = document.querySelector(`input[name="material_f_${s}"][value="Sonstiges"]`);
    const matOtherEl = document.getElementById(`materialOtherText_f_${s}`);
    if (matSonst && matOtherEl) matOtherEl.disabled = !matSonst.checked;
    if (document.querySelectorAll(`input[name="material_f_${s}"]:checked`).length === 0) allValid = false;
    if (matSonst && matSonst.checked && !matOtherEl?.value.trim()) allValid = false;
  });
  return allValid;
}

function getFuellungData() {
  const teeth = parseTeeth(document.getElementById('toothNumber_f').value.trim());
  const tData = teeth.map(t => {
      const s = t.replace(/\W/g, '');
      return {
          t, s,
          flaechen: document.getElementById(`toothSurfaces_f_${s}`)?.value.trim(),
          mkv: getValT('mkv_f', s),
          mkvPrice: document.getElementById(`mkvPrice_f_${s}`)?.value.trim(),
          vipr: getValT('vipr_f', s), viprRes: getValT('viprResult_f', s),
          anae: getValT('anaesthesie_f', s),
          anaeType: Array.from(document.querySelectorAll(`input[name="anaeType_f_${s}"]:checked`)).map(c => c.value),
          matrize: getValT('matrize_f', s),
          bmf: getValT('bmf_f', s),
          bmfType: getValT('bmfType_f', s) === 'Sonstiges' ? document.getElementById(`bmfOtherText_f_${s}`)?.value.trim() : getValT('bmfType_f', s),
          cpp: getValT('cpp_f', s),
          cppMat: getValT('cppMaterial_f', s) === 'Sonstiges' ? document.getElementById(`cppOtherText_f_${s}`)?.value.trim() : getValT('cppMaterial_f', s),
          farbe: document.getElementById(`zahnfarbe_f_${s}`)?.value.trim(),
          aufbau: getValT('aufbau_f', s), aufbauArt: getValT('aufbauArt_f', s),
          mats: Array.from(document.querySelectorAll(`input[name="material_f_${s}"]:checked`)).map(cb => cb.value === 'Sonstiges' ? document.getElementById(`materialOtherText_f_${s}`).value.trim() : cb.value).filter(Boolean)
      };
  });
  const reason = `zur Füllung an ${teeth.length > 1 ? 'den Zähnen' : 'Zahn'} ${tData.map(d => `${d.t} (${d.flaechen})`).join(', ')}`;
  const todayLines = [`Aufklärung Füllungstherapie erfolgt`, `Aufklärung Füllungsmaterial`];
  const mkvTeeth = tData.filter(d => d.mkv === 'Ja');
  if (mkvTeeth.length > 0) {
      todayLines.push(`Pat. ausführlich über Selbstkostbeteiligung für ${mkvTeeth.length > 1 ? `Füllungen an den Zähnen ${mkvTeeth.map(d=>d.t).join(', ')}` : `Füllung an Zahn ${mkvTeeth[0].t}`} aufgeklärt`);
      todayLines.push(`Pat. ist mit Zusatzkosten in Höhe von ${[...new Set(mkvTeeth.map(d => d.mkvPrice))].join(' / ')} einverstanden`);
  }
  tData.forEach(d => { if (d.vipr === 'Ja') todayLines.push(`${d.t} ViPr ${d.viprRes} (Eisspray)`); });
  const anaeGroups = {};
  tData.filter(d => d.anae === 'Ja').forEach(d => { const ts = d.anaeType.join(' / '); if (!anaeGroups[ts]) anaeGroups[ts] = []; anaeGroups[ts].push(d.t); });
  for (const [type, ts] of Object.entries(anaeGroups)) todayLines.push(`Anästhesie ${ts.join(' und ')} ${type} 1:200.000`);
  todayLines.push(`Karies vollständig exkaviert`);
  const bmfTeethGroups = {};
  tData.filter(d => d.bmf === 'Ja').forEach(d => { if(!bmfTeethGroups[d.bmfType]) bmfTeethGroups[d.bmfType] = []; bmfTeethGroups[d.bmfType].push(d.t); });
  for (const [type, ts] of Object.entries(bmfTeethGroups)) todayLines.push(`${ts.join(', ')} bMF: ${type}`);
  const matrizeTeeth = tData.filter(d => d.matrize === 'Ja').map(d => d.t);
  if (matrizeTeeth.length > 0) todayLines.push(`${matrizeTeeth.join(', ')} Matrize + Keil gelegt`);
  const farbeGroups = {};
  tData.filter(d => d.farbe).forEach(d => { if(!farbeGroups[d.farbe]) farbeGroups[d.farbe] = []; farbeGroups[d.farbe].push(d.t); });
  for (const [f, ts] of Object.entries(farbeGroups)) todayLines.push(`Zahnfarbe ${f} für ${ts.join(' und ')}`);
  tData.filter(d => d.cpp === 'CP' || d.cpp === 'P').forEach(d => todayLines.push(`${d.t} ${d.cpp} mit ${d.cppMat}`));
  let needsOkklusion = false;
  let removedFadenTeeth = [];
  let counts = { 'Füllung': 0, 'Aufbaufüllung': 0 };

  tData.forEach(d => {
      const isAufbau = d.aufbau === 'Ja';
      const art = isAufbau ? `Aufbaufüllung (für ${d.aufbauArt})` : 'Füllung';
      counts[isAufbau ? 'Aufbaufüllung' : 'Füllung']++;
      
      const hasNoBonding = d.mats.includes('Ketac') || d.mats.includes('Riva Light Cure');
      todayLines.push(`${art} gelegt an Zahn ${d.t} ${hasNoBonding ? 'mit ' : 'mit Bonding + '}${d.mats.join(' / ')}`);
      
      if (d.bmf === 'Ja' && d.bmfType === 'Retraktionsfaden') removedFadenTeeth.push(d.t);

      const tNum = parseInt(d.t, 10);
      const q = Math.floor(tNum / 10);
      const digit = tNum % 10;
      const surf = (d.flaechen || '').toLowerCase();
      
      const isPosterior = digit >= 4 && digit <= 8; 
      const isAnterior = digit >= 1 && digit <= 3;  
      const isUpper = (q === 1 || q === 2 || q === 5 || q === 6); 
      const isLower = (q === 3 || q === 4 || q === 7 || q === 8); 

      if (isPosterior && surf.includes('o')) needsOkklusion = true;
      if (isUpper && isAnterior && surf.includes('p')) needsOkklusion = true;
      if (isLower && isAnterior && surf.includes('i')) needsOkklusion = true;
  });

  if (needsOkklusion) todayLines.push(`Okklusion überprüft`);
  let arts = [];
  if (counts['Füllung'] === 1) arts.push('Füllung'); else if (counts['Füllung'] > 1) arts.push('Füllungen');
  if (counts['Aufbaufüllung'] === 1) arts.push('Aufbaufüllung'); else if (counts['Aufbaufüllung'] > 1) arts.push('Aufbaufüllungen');
  if (arts.length > 0) todayLines.push(`${arts.join(' und ')} poliert`);
  if (removedFadenTeeth.length > 0) todayLines.push(`Retraktionsfaden entfernt (${removedFadenTeeth.join(', ')})`);
  
  return { reason, todayLines, autoNext: [] };
}