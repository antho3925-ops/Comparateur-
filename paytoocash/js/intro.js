// Animation d'entrée de l'accueil : un vortex s'ouvre, des objets en jaillissent
// en spirale, le logo apparaît, puis le vortex s'ouvre comme un portail sur le site.
// Script classique (non module) chargé en haut du <body> pour couvrir la page
// avant son premier affichage. Jouée une fois par visite ; ?intro=1 la force.
(function () {
  var force = /[?&]intro=1/.test(location.search);
  var vue = false;
  try { vue = sessionStorage.getItem('intro-vue') === '1'; } catch (e) {}
  if (!force && (vue || matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  try { sessionStorage.setItem('intro-vue', '1'); } catch (e) {}

  // Illustrations génériques (aucun personnage ni logo de marque).
  var dos = function (couleur) {
    return '<svg viewBox="0 0 40 80"><rect x="1" y="1" width="38" height="78" rx="9" fill="' + couleur + '"/>' +
      '<rect x="1" y="1" width="38" height="78" rx="9" fill="url(#ix-sheen)"/>' +
      '<rect x="4.5" y="4.5" width="17" height="17" rx="5" fill="rgba(0,0,0,.18)"/>' +
      '<circle cx="9.5" cy="9.5" r="3.4" fill="#1b1b1d"/><circle cx="16.5" cy="16.5" r="3.4" fill="#1b1b1d"/>' +
      '<circle cx="16.5" cy="9.5" r="1.5" fill="#f4f1e6"/></svg>';
  };
  var OBJETS = {
    ecran: '<svg viewBox="0 0 40 80"><rect x="1" y="1" width="38" height="78" rx="9" fill="#1b1b1d"/>' +
      '<rect x="3.5" y="3.5" width="33" height="73" rx="7" fill="url(#ix-wall)"/>' +
      '<rect x="14" y="6.5" width="12" height="3.6" rx="1.8" fill="#1b1b1d"/></svg>',
    dosOr: dos('#d9c7a5'), dosBleu: dos('#41526b'), dosRose: dos('#e8c4c4'),
    retro: '<svg viewBox="0 0 50 80"><rect x="1" y="1" width="48" height="78" rx="4" fill="#cfccc4"/>' +
      '<path d="M1 64v11a4 4 0 0 0 4 4h30c8 0 14-6 14-14V64z" fill="#c2bfb6"/>' +
      '<rect x="6" y="6" width="38" height="31" rx="3" fill="#5b616e"/><rect x="11" y="10" width="28" height="23" fill="#8fae3a"/>' +
      '<rect x="11" y="10" width="28" height="23" fill="url(#ix-sheen)"/>' +
      '<path d="M9.5 52h13M16 45.5v13" stroke="#2b2b2b" stroke-width="4.6"/>' +
      '<circle cx="35" cy="54" r="4.2" fill="#8c2a55"/><circle cx="43" cy="48" r="4.2" fill="#8c2a55"/></svg>',
    manette: '<svg viewBox="0 0 90 60"><path d="M22 6h46c12 0 20 8 21 20l1 14c1 11-11 17-18 9l-6-7H24l-6 7c-7 8-19 2-18-9l1-14C2 14 10 6 22 6z" fill="#23262b"/>' +
      '<path d="M22 6h46c12 0 20 8 21 20l1 14c1 11-11 17-18 9l-6-7H24l-6 7c-7 8-19 2-18-9l1-14C2 14 10 6 22 6z" fill="url(#ix-sheen)"/>' +
      '<path d="M16 26h14M23 19v14" stroke="#e8e6df" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="64" cy="20" r="3.6" fill="#e8b530"/><circle cx="71" cy="27" r="3.6" fill="#1f6b3a"/><circle cx="57" cy="27" r="3.6" fill="#3d7fd9"/><circle cx="64" cy="34" r="3.6" fill="#c8453c"/></svg>',
    carte: '<svg viewBox="0 0 60 84"><rect x="1" y="1" width="58" height="82" rx="5" fill="#e8b530"/>' +
      '<rect x="5" y="5" width="50" height="74" rx="3" fill="#1d3f8f"/><rect x="5" y="5" width="50" height="74" rx="3" fill="url(#ix-sheen)"/>' +
      '<circle cx="30" cy="42" r="15" fill="none" stroke="#e8b530" stroke-width="2.5"/>' +
      '<path d="m30 31 3.3 6.8 7.4 1-5.4 5.1 1.3 7.3L30 47.7l-6.6 3.5 1.3-7.3-5.4-5.1 7.4-1z" fill="#e8b530"/></svg>',
    piece: '<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="29" fill="#b9851a"/><circle cx="30" cy="30" r="25" fill="#e8b530"/>' +
      '<circle cx="30" cy="30" r="25" fill="url(#ix-sheen)"/><circle cx="30" cy="30" r="19" fill="none" stroke="#b9851a" stroke-width="2"/>' +
      '<text x="30" y="39" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="25" fill="#7a5710">€</text></svg>',
    billet: '<svg viewBox="0 0 100 52"><rect x="1" y="1" width="98" height="50" rx="4" fill="#5f9c6c"/>' +
      '<rect x="6" y="6" width="88" height="40" rx="2" fill="none" stroke="#e7f1ea" stroke-opacity=".6" stroke-width="1.5"/>' +
      '<circle cx="50" cy="26" r="12" fill="#e7f1ea" fill-opacity=".35"/><rect x="1" y="1" width="98" height="50" rx="4" fill="url(#ix-sheen)"/>' +
      '<text x="50" y="32" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="16" fill="#1f4a2b">50</text></svg>',
  };
  // [objet, largeur (px), angle de départ, distance (vmax), délai (ms), rotation propre]
  var VOL = [
    ['ecran', 44, 10, 75, 250, 200], ['carte', 46, 55, 80, 330, -260], ['piece', 40, 100, 70, 390, 400],
    ['dosOr', 42, 145, 78, 460, -180], ['manette', 74, 190, 82, 300, 160], ['retro', 44, 235, 76, 520, -220],
    ['billet', 80, 280, 80, 420, 120], ['dosBleu', 42, 325, 74, 560, 240], ['carte', 40, 30, 68, 640, 300],
    ['piece', 34, 80, 72, 700, -360], ['ecran', 38, 125, 70, 760, -160], ['dosRose', 40, 170, 74, 610, 220],
    ['carte', 44, 215, 72, 820, -240], ['piece', 30, 260, 66, 880, 320], ['retro', 38, 300, 70, 900, 180],
    ['billet', 66, 350, 76, 960, -140], ['manette', 60, 65, 74, 1020, 200], ['piece', 36, 205, 68, 1080, -300],
  ];

  // Scène 1 : ordinateurs portables qui s'ouvrent en éventail.
  var PORTABLES = [
    ['#d6d8dc', '#f3f4f6', -34, 'linear-gradient(135deg,#a8c0ff,#3f2b96)', 0],
    ['#ecbcc4', '#fbe7ea', -12, 'linear-gradient(135deg,#ff9a8b,#ff6a88 55%,#ff99ac)', 90],
    ['#e6df6e', '#f8f5cf', 12, 'linear-gradient(135deg,#f6d365,#fda085)', 180],
    ['#2e3b58', '#cfd5e2', 34, 'linear-gradient(135deg,#43cea2,#185a9d)', 270],
  ];
  var scene1 = PORTABLES.map(function (l) {
    return '<div class="ix-lpw" style="--c:' + l[0] + ';--c2:' + l[1] + ';--rz:' + l[2] + 'deg;--wp:' + l[3] + ';--dl:' + l[4] + 'ms">' +
      '<div class="ix-cam"><div class="ix-lp"><div class="ix-lp-base"><i class="kb"></i><i class="tp"></i></div>' +
      '<div class="ix-lp-lid"><i class="scr"></i></div></div></div></div>';
  }).join('');
  // Scène 2 : tablettes déployées comme un jeu de cartes.
  var TABLETTES = [['#6f7076', -26], ['#c6dde3', -13], ['#e7dcc8', 0], ['#dcd2e8', 13], ['', 26]];
  var scene2 = TABLETTES.map(function (t, i) {
    return '<div class="ix-tab' + (t[0] ? '' : ' ix-tab-front') + '" style="--c:' + (t[0] || '#111') + ';--r:' + t[1] + 'deg;--dl:' + i * 60 + 'ms"><i></i></div>';
  }).join('');
  // Scène 3 : diamant en trait doré qui se dessine.
  var traits = ['M35 20H65L85 34L50 82L15 34Z', 'M15 34H85', 'M15 34L35 20L32.5 34L50 20L67.5 34L65 20L85 34',
    'M32.5 34L50 82L67.5 34', 'M15 34L41 58M85 34L59 58M50 34V82'];
  var scene3 = '<i class="ix-glow"></i><svg class="ix-diam" viewBox="0 0 100 100"><defs><linearGradient id="ix-gold" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#fff3c4"/><stop offset=".5" stop-color="#e8b530"/><stop offset="1" stop-color="#b9851a"/></linearGradient></defs>' +
    traits.map(function (d, i) { return '<path pathLength="1" style="--dl:' + i * 90 + 'ms" d="' + d + '"/>'; }).join('') + '</svg><i class="ix-spark"></i>';

  var html = '<div class="ix\" id="intro" role="presentation" aria-hidden="true">' +
    '<svg width="0" height="0" style="position:absolute"><defs>' +
      '<linearGradient id="ix-wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1f6b3a"/><stop offset=".55" stop-color="#2f8f52"/><stop offset="1" stop-color="#e8b530"/></linearGradient>' +
      '<linearGradient id="ix-sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>' +
    '</defs></svg>' +
    '<div class="ix-vortex"><i class="ix-ring r1"></i><i class="ix-ring r2"></i><i class="ix-ring r3"></i><i class="ix-streaks"></i><i class="ix-core"></i></div>' +
    '<div class="ix-objets">' + VOL.map(function (v) {
      return '<span class="ix-o" style="--a:' + v[2] + 'deg;--d:' + v[3] + 'vmax;--t:' + v[4] + 'ms;--s:' + v[5] + 'deg;--w:' + v[1] + 'px">' +
        '<span class="ix-o-in">' + OBJETS[v[0]] + '</span></span>';
    }).join('') + '</div>' +
    '<div class="ix-scene ix-s1"><div class="ix-fan">' + scene1 + '</div><span class="ix-cap">Informatique</span></div>' +
    '<div class="ix-scene ix-s2"><div class="ix-fan2">' + scene2 + '</div><span class="ix-cap">Tablettes &amp; smartphones</span></div>' +
    '<div class="ix-scene ix-s3">' + scene3 + '<span class="ix-cap">Bijoux &amp; or</span></div>' +
    '<div class="ix-logo"><img src="paytoocash-logo/logo.svg" alt=""><i></i><span>Achat · Vente · Rachat cash</span></div>' +
    '<button class="ix-skip" type="button">Passer</button>' +
    '</div>';
  document.body.insertAdjacentHTML('afterbegin', html);
  document.documentElement.classList.add('ix-on');

  var el = document.getElementById('intro');
  var fini = false;
  var portail = window.CSS && CSS.registerProperty;
  if (portail) {
    try { CSS.registerProperty({ name: '--ix-r', syntax: '<length>', inherits: true, initialValue: '0px' }); } catch (e) {}
  }
  function terminer() {
    if (fini) return;
    fini = true;
    el.classList.add(portail ? 'ix-open' : 'ix-fade');
    document.documentElement.classList.remove('ix-on');
    setTimeout(function () { el.remove(); }, 1000);
  }
  var timer = setTimeout(terminer, 5600);
  el.addEventListener('click', function () { clearTimeout(timer); terminer(); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { clearTimeout(timer); terminer(); } });
})();
