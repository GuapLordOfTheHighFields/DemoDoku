function check01Ready() {
  const isChild = isChildGlobal();
  document.getElementById('adultSection_01').style.display = isChild === 'Nein' ? 'block' : 'none';
  document.getElementById('childSection_01').style.display = isChild === 'Ja' ? 'block' : 'none';
  document.getElementById('mskAdultOptions_01').classList.toggle('show', getVal('mskAdult_01') === 'Auffällig');
  document.getElementById('mskChildOptions_01').classList.toggle('show', getVal('mskChild_01') === 'Auffällig');
  document.getElementById('kfoOptions_01').classList.toggle('show', getVal('kfo_01') === 'Auffällig');
  document.getElementById('roentgenOptions_01').classList.toggle('show', getVal('roentgen_01') === 'Ja');

  if (!getVal('neupatient_01') || !getVal('roentgen_01')) return false;
  if (getVal('roentgen_01') === 'Ja' && document.querySelectorAll('input[name="roentgenType_01"]:checked').length === 0) return false;

  if (isChild === 'Nein') {
    const mOK = getVal('mskAdult_01') === 'o.p.B.' || (getVal('mskAdult_01') === 'Auffällig' && document.getElementById('mskAdultText_01').value.trim());
    return mOK && getVal('psi_01') && getVal('pzr_01') && getVal('pa_01') && getVal('zst_01');
  } else if (isChild === 'Ja') {
    const mOK = getVal('mskChild_01') === 'o.p.B.' || (getVal('mskChild_01') === 'Auffällig' && document.getElementById('mskChildText_01').value.trim());
    const kOK = getVal('kfo_01') === 'o.p.B.' || (getVal('kfo_01') === 'Auffällig' && document.getElementById('kfoText_01').value.trim());
    return getVal('untersuchung_01') && getVal('gebiss_01') && mOK && getVal('zunge_01') && getVal('baender_01') && kOK;
  }
  return false;
}

function get01Data() {
  const isChild = isChildGlobal();
  let reason; const otherBefund = []; const todayLines = [];
  const isNeupatient = getVal('neupatient_01') === 'Ja';
  if (isChild === 'Nein') {
    reason = "zur halbjährlichen Kontrolluntersuchung";
    todayLines.push(`eingehende Untersuchung 01`);
    let mskInfo = getVal('mskAdult_01') === 'o.p.B.' ? 'o.p.B.' : document.getElementById('mskAdultText_01').value.trim();
    todayLines.push(`Mundschleimhautkontrolle durchgeführt - ${mskInfo}`);
    if (getVal('psi_01') === 'Ja') todayLines.push(`PSI aufgenommen`);
    todayLines.push(`Mundhygieneinstruktion gegeben`);
    if (getVal('pzr_01') === 'Ja') todayLines.push(`Professionelle Zahnreinigung empf.`);
    if (getVal('pa_01') === 'Ja') todayLines.push(`Parodontalbehandlung (PA) empf.`);
    if (getVal('zst_01') === 'Ja') todayLines.push(`Zahnstein entfernt`);
  } else {
    reason = getVal('untersuchung_01') === 'FU' ? "zur Frühuntersuchung" : "zur eingehenden Untersuchung";
    otherBefund.push(`Pat. im ${getVal('gebiss_01')}`);
    todayLines.push(getVal('untersuchung_01') === 'FU' ? `Frühuntersuchung` : `eingehende Untersuchung`);
    todayLines.push(`Praktische Anleitung der erziehungsberechtigten Person zur Mundhygiene + Putzanleitung des Kindes`);
    todayLines.push(`Ernährungsanweisungen + Fluoridierungsmaßnahmen besprochen`);
    let mskInfo = getVal('mskChild_01') === 'o.p.B.' ? 'o.p.B.' : document.getElementById('mskChildText_01').value.trim();
    todayLines.push(`Schleimhautkontr. ${mskInfo}`);
    todayLines.push(`${getVal('zunge_01') === 'nicht eingeschränkt' ? 'Zungenbeweglichkeit nicht eingeschränkt' : 'Zungenbeweglichkeit eingeschränkt'}, ${getVal('baender_01') === 'keine' ? 'keine störenden Bänder' : 'störende Bänder'}`);
    let kfoInfo = getVal('kfo_01') === 'o.p.B.' ? 'o.p.B.' : document.getElementById('kfoText_01').value.trim();
    todayLines.push(`KFO ${kfoInfo}`);
  }
  if (getVal('roentgen_01') === 'Ja') todayLines.push(`Röntgendiagnostik: ${Array.from(document.querySelectorAll('input[name="roentgenType_01"]:checked')).map(x=>x.value).join(' / ')}`);
  const sonst01 = document.getElementById('therapieSonstiges_01')?.value.trim();
  const todayLinesTrailing = sonst01 ? [sonst01] : [];
  return { reason, otherBefund, todayLines, todayLinesTrailing, isNeupatient, autoNext: [] };
}