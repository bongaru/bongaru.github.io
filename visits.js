(() => {
  const output = document.getElementById('visits-count');
  if (!output) return;
  let counted = false;
  try { counted = sessionStorage.getItem('glab-visit-counted') === '1'; } catch (_) {}
  fetch('https://asia-northeast3-relayon-69d6b.cloudfunctions.net/glabWebsiteVisits', {
    method: counted ? 'GET' : 'POST', cache: 'no-store'
  }).then(response => {
    if (!response.ok) throw new Error('Counter unavailable');
    return response.json();
  }).then(({count}) => {
    if (!Number.isSafeInteger(count) || count < 0) throw new Error('Invalid counter');
    output.textContent = new Intl.NumberFormat('ko-KR').format(count);
    document.getElementById('visit-counter').hidden = false;
    try { sessionStorage.setItem('glab-visit-counted', '1'); } catch (_) {}
  }).catch(() => {});
})();
