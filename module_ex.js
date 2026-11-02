function checkExReady() {
  const proc = getVal('procedure_ex'); const isKombi = proc === 'Kombiniert';
  document.getElementById('teethSingle_ex').style.display = (proc && !isKombi) ? 'block' : 'none';
  document.getElementById('teethKombi_ex').style.display = isKombi ? 'grid' : 'none';
  let teethObj = [];
  if (isKombi) {
    parseTeeth(document.getElementById('toothNumber_ex_ext').value).forEach(t => teethObj.push({t, type:'Extraktion'}));
    parseTeeth(document.getElementById('toothNumber_ex_ost').value).forEach(t => teethObj.push({t, type:'Osteotomie'}));
  } else {
    parseTeeth(document.getElementById('toothNumber_ex').value).forEach(t => teethObj.push({t, type: proc}));
  }
  updateBlocks('dyn_ex', 'tpl_ex', teethObj);
  const basicReady = proc !== '' && teethObj.length > 0;
  document.getElementById('therapieSection_ex').style.display = basicReady ? 'block' : 'none';
  if (!basicReady) return false;
  let allValid = true;
  teethObj.forEach(item => {
    const s = `${item.t.replace(/\W/g, '')}_${item.type.substring(0,3)}`;
    const cX = document.getElementById(`card-xtype_ex_${s}`); if (cX) cX.style.display = item.type === 'Osteotomie' ? 'none' : 'block';
    const needsMAV = hasUpperPosterior(item.t);
    const cMav = document.getElementById(`card-mav_ex_${s}`); if(cMav) cMav.style.display = needsMAV ? 'block' : 'none';
    if (getValT('mav_ex', s) === 'positiv' && needsMAV) { const nahtJa = document.querySelector(`input[name="naht_ex_${s}"][value="Ja"]`); if (nahtJa) nahtJa.checked = true; }
    document.getElementById(`nahtOptions_ex_${s}`)?.classList.toggle('show', getValT('naht_ex', s) === 'Ja');

    if(document.querySelectorAll(`input[name="anae_ex_${s}"]:checked`).length === 0) allValid = false;
    if(item.type !== 'Osteotomie' && !getValT('xtype_ex', s)) allValid = false;
    if(getValT('naht_ex', s) === 'Ja' && !document.getElementById(`nahtCount_ex_${s}`)?.value) allValid = false;
    if(!getValT('ekr_ex', s) || !getValT('knochen_ex', s) || !getValT('naht_ex', s)) allValid = false;
    if(needsMAV && !getValT('mav_ex', s)) allValid = false;
  });
  return allValid;
}

function getExData() {
  const proc = getVal('procedure_ex'); let teethObj = [];
  if (proc === 'Kombiniert') {
    parseTeeth(document.getElementById('toothNumber_ex_ext').value).forEach(t => teethObj.push({t, type:'Extraktion'}));
    parseTeeth(document.getElementById('toothNumber_ex_ost').value).forEach(t => teethObj.push({t, type:'Osteotomie'}));
  } else {
    parseTeeth(document.getElementById('toothNumber_ex').value).forEach(t => teethObj.push({t, type:proc}));
  }
  const allTeeth = teethObj.map(o=>o.t);
  const reason = proc === 'Kombiniert' ? `zur Extraktion und Osteotomie (${allTeeth.join(', ')})` : `zur ${proc} ${allTeeth.length > 1 ? 'der Zähne' : 'von Zahn'} ${allTeeth.join(', ')}`;

  const tData = teethObj.map(item => {
     const s = `${item.t.replace(/\W/g, '')}_${item.type.substring(0,3)}`;
     return {
         t: item.t, type: item.type,
         anaes: Array.from(document.querySelectorAll(`input[name="anae_ex_${s}"]:checked`)).map(c => c.value),
         ekr: getValT('ekr_ex', s), xtype: getValT('xtype_ex', s), knochen: getValT('knochen_ex', s),
         loeffel: getValT('loeffel_ex', s), // <-- NEU HINZUGEFÜGT
         mav: getValT('mav_ex', s), naht: getValT('naht_ex', s), nahtC: document.getElementById(`nahtCount_ex_${s}`)?.value.trim()
     };
  });

  const todayLines = [`Aufklärung vor chir. Eingriff`];
  const allAnaes = new Set(); tData.forEach(d => d.anaes.forEach(a => allAnaes.add(a)));
  if(allAnaes.size > 0) { todayLines.push(`Aufklärung ${[...allAnaes].join('/')}`); todayLines.push(`Anästhesie ${[...allAnaes].join('/')} 1:200.000 Ubistesin (${allTeeth.join(', ')})`); }

  const ekrTeeth = tData.filter(d=>d.ekr==='Ja').map(d=>d.t);
  if(ekrTeeth.length > 0) todayLines.push(`Entfernen d. vorhandenen Krone an ${ekrTeeth.join(', ')}`);

  tData.forEach(d => {
      if (d.type === 'Extraktion') {
          if (d.xtype === 'X3') todayLines.push(`Zahn ${d.t} während Extraktion frakturiert`);
          todayLines.push(`Zahn ${d.t} extrahiert`);
      } else { todayLines.push(`Zahn ${d.t} mittels Osteotomie extrahiert`); }
  });

  // NEU HINZUGEFÜGT: Logik für den scharfen Löffel (inkl. Zahnangaben)
  const loeffelTeeth = tData.filter(d=>d.loeffel==='Ja').map(d=>d.t);
  if(loeffelTeeth.length > 0) todayLines.push(`Wunde mit scharfem Löffel gesäubert (${loeffelTeeth.join(', ')})`);

  const knochenTeeth = tData.filter(d=>d.knochen==='Ja').map(d=>d.t);
  if(knochenTeeth.length > 0) todayLines.push(`Knochen geglättet (${knochenTeeth.join(', ')})`);

  tData.forEach(d => { if(d.mav) todayLines.push(`${d.t} MAV/NBV ${d.mav}`); });

  let nahtTotal = 0; tData.forEach(d => { if(d.naht==='Ja') nahtTotal += parseInt(d.nahtC||'0'); });
  if(nahtTotal > 0) todayLines.push(`${nahtTotal} x Naht 4-0`);

  todayLines.push(`Aufklärung über Verhalten nach chir. Eingriff`);

  return { reason, todayLines, autoNext: nahtTotal > 0 ? ['Naht ex'] : ['N'] };
}
