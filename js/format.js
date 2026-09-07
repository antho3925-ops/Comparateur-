// Formatage suisse : apostrophe comme separateur de milliers.
window.Fmt = {
  chf(n) {
    if (n == null || Number.isNaN(n)) return '—';
    const arrondi = Math.round(n * 100) / 100;
    const [ent, dec] = arrondi.toFixed(2).split('.');
    return ent.replace(/\B(?=(\d{3})+(?!\d))/g, "'") + '.' + dec;
  },
  pct(t) {
    return t == null ? '—' : Math.round(t * 100) + '%';
  },
  nombre(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  },
};
