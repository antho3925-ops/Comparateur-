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
  // Noms de marques (en texte, jamais leurs logos) qui jaillissent du vortex.
  // Logos des marques vendues (js/marques.js) ; le nom en texte quand il n'y a pas de logo vectoriel.
  var MARQUES = window.PAYTOO_MARQUES || [];
  var marque = function (m) {
    return m[1] ? '<svg viewBox="0 0 24 24" role="img" aria-label="' + m[0] + '"><path d="' + m[1] + '"/></svg>' : '<em>' + m[0] + '</em>';
  };
  // Particules : objets et marques en alternance, en vagues tout au long de l'intro.
  var TYPES = ['ecran', 'carte', 'piece', 'dosOr', 'manette', 'retro', 'billet', 'dosBleu', 'carte', 'piece', 'dosRose'];
  var TAILLES = { ecran: 40, carte: 42, piece: 36, dosOr: 40, manette: 66, retro: 40, billet: 72, dosBleu: 40, dosRose: 40 };
  var particules = '';
  for (var i = 0; i < 40; i++) {
    var angle = Math.round((i * 137.5) % 360), delai = 250 + i * 175, dist = 68 + (i * 7) % 15;
    if (i % 2) {
      particules += '<span class="ix-o ix-b" style="--a:' + angle + 'deg;--d:' + dist + 'vmax;--t:' + delai + 'ms;--s:0deg;--w:0px">' +
        '<span class="ix-o-in">' + (MARQUES.length ? marque(MARQUES[((i - 1) / 2) % MARQUES.length]) : '') + '</span></span>';
    } else {
      var t = TYPES[(i / 2) % TYPES.length];
      particules += '<span class="ix-o" style="--a:' + angle + 'deg;--d:' + dist + 'vmax;--t:' + delai + 'ms;--s:' + ((i % 4 ? 1 : -1) * (160 + i * 7)) + 'deg;--w:' + TAILLES[t] + 'px">' +
        '<span class="ix-o-in">' + OBJETS[t] + '</span></span>';
    }
  }

  // Scène 0 : un smartphone s'allume (logo Paytoocash + chargement), puis
  // son écran d'accueil présente les rayons du magasin comme des applications.
  var ICO = {"smartphone": "<rect x=\"6\" y=\"2.5\" width=\"12\" height=\"19\" rx=\"2.5\"/><path d=\"M10.5 18.5h3\"/>", "ordinateur": "<rect x=\"4.5\" y=\"4.5\" width=\"15\" height=\"10.5\" rx=\"1.5\"/><path d=\"M2 19h20l-1.5-4h-17z\"/>", "tv": "<rect x=\"2.5\" y=\"7\" width=\"19\" height=\"13\" rx=\"2\"/><path d=\"M8 2.5l4 4.5 4-4.5\"/>", "montre": "<rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"3.2\"/><path d=\"M9 6l.8-3.5h4.4L15 6M9 18l.8 3.5h4.4L15 18M12 9.5V12l1.8 1.3\"/>", "casque": "<path d=\"M4 15.5V12a8 8 0 0 1 16 0v3.5\"/><rect x=\"3\" y=\"14\" width=\"4.5\" height=\"7\" rx=\"1.6\"/><rect x=\"16.5\" y=\"14\" width=\"4.5\" height=\"7\" rx=\"1.6\"/>", "manette": "<path d=\"M7 7h10a4.6 4.6 0 0 1 4.5 5.6l-.9 4.2a2.6 2.6 0 0 1-4.5 1.2L14.4 16H9.6L7.9 18a2.6 2.6 0 0 1-4.5-1.2l-.9-4.2A4.6 4.6 0 0 1 7 7z\"/><path d=\"M8 10v4M6 12h4\"/><circle cx=\"15.8\" cy=\"10.8\" r=\"0.9\" fill=\"#fff\" stroke=\"none\"/><circle cx=\"17.6\" cy=\"12.8\" r=\"0.9\" fill=\"#fff\" stroke=\"none\"/>", "photo": "<path d=\"M3 8.5A2 2 0 0 1 5 6.5h2.5L9 4h6l1.5 2.5H19a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/><circle cx=\"12\" cy=\"13\" r=\"3.8\"/>", "diamant": "<path d=\"M6 3.5h12L21.5 9 12 21 2.5 9z\"/><path d=\"M2.5 9h19M9.5 3.5 8 9l4 12 4-12-1.5-5.5\"/>", "perceuse": "<path d=\"M3.5 6h10.5a2.5 2.5 0 0 1 2.5 2.5v.5a2.5 2.5 0 0 1-2.5 2.5H3.5z\"/><path d=\"M16.5 8.75H21M3.5 6v5.5\"/><path d=\"M7 11.5 6 21h5l1-9.5\"/><path d=\"M10 14.5h1.5\"/>", "musique": "<path d=\"M9 18V5.5l11-2.5v13\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><circle cx=\"17\" cy=\"16\" r=\"3\"/>", "trottinette": "<circle cx=\"5.5\" cy=\"18\" r=\"2.5\"/><circle cx=\"18.5\" cy=\"18\" r=\"2.5\"/><path d=\"M8 18h8M18.5 18 15 4M12.5 4h5\"/>", "cartes": "<rect x=\"3\" y=\"6\" width=\"11\" height=\"15\" rx=\"1.6\" transform=\"rotate(-10 8.5 13.5)\"/><rect x=\"10\" y=\"3\" width=\"11\" height=\"15\" rx=\"1.6\" transform=\"rotate(8 15.5 10.5)\"/><path d=\"m15.6 7.4.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z\"/>", "console_portable": "<rect x=\"5.5\" y=\"2\" width=\"13\" height=\"20\" rx=\"2.2\"/><rect x=\"8\" y=\"4.5\" width=\"8\" height=\"6.5\" rx=\"1\"/><path d=\"M8 15.5h3M9.5 14v3\"/><circle cx=\"15.3\" cy=\"14.6\" r=\"0.9\" fill=\"#fff\" stroke=\"none\"/><circle cx=\"13.9\" cy=\"16.9\" r=\"0.9\" fill=\"#fff\" stroke=\"none\"/>", "tablette": "<rect x=\"3.5\" y=\"3\" width=\"17\" height=\"18\" rx=\"2.5\"/><path d=\"M11 18h2\"/>", "electromenager": "<rect x=\"4\" y=\"2.5\" width=\"16\" height=\"19\" rx=\"2\"/><path d=\"M4 7h16\"/><circle cx=\"12\" cy=\"14\" r=\"4.3\"/><circle cx=\"7.2\" cy=\"4.8\" r=\"0.8\" fill=\"#fff\" stroke=\"none\"/><circle cx=\"10\" cy=\"4.8\" r=\"0.8\" fill=\"#fff\" stroke=\"none\"/>", "jardin": "<path d=\"M12 21v-9\"/><path d=\"M12 12C12 7 8.5 4 4 4c0 5 3.5 8 8 8z\"/><path d=\"M12 14.5c0-4.2 3-7 8-7 0 4.5-3 7-8 7z\"/>", "phone": "<path d=\"M5 3h3.5l1.8 4.5-2.3 1.4a11 11 0 0 0 7.1 7.1l1.4-2.3L21 15.5V19a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z\"/>", "message": "<path d=\"M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1z\"/><path d=\"M8 10h8M8 13h5\"/>", "store": "<path d=\"M4 10v10h16V10\"/><path d=\"M3 10 5 4h14l2 6c0 1.4-1.3 2.5-3 2.5S15 11.4 15 10c0 1.4-1.3 2.5-3 2.5S9 11.4 9 10c0 1.4-1.3 2.5-3 2.5S3 11.4 3 10z\"/><path d=\"M10 20v-5h4v5\"/>", "cash": "<rect x=\"2.5\" y=\"6\" width=\"19\" height=\"12\" rx=\"2\"/><circle cx=\"12\" cy=\"12\" r=\"2.6\"/><path d=\"M6 9.5v5M18 9.5v5\"/>"};
  var pic = function (k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + ICO[k] + '</svg>'; };
  var APPS = [['smartphone', '#1f6b3a'], ['ordinateur', '#3d7fd9'], ['tv', '#5a5f6b'], ['montre', '#b9851a'],
    ['casque', '#c8453c'], ['manette', '#6a3fd1'], ['photo', '#2b2d33'], ['diamant', '#0f8fb0'],
    ['perceuse', '#e08a1e'], ['musique', '#d63d74'], ['trottinette', '#2e9e6b'], ['cartes', '#e8b530'],
    ['console_portable', '#7b8794'], ['tablette', '#4f5bd5'], ['electromenager', '#14a3a3'], ['jardin', '#4c9a2a']];
  var DOCK = [['phone', '#2fbf5b'], ['message', '#3d9df2'], ['store', '#1f6b3a'], ['cash', '#e8b530']];
  var appli = function (a, i) { return '<span class="ix-app" style="--bg:' + a[1] + ';--dl:' + i * 35 + 'ms">' + pic(a[0]) + '</span>'; };
  var scene0 = '<i class="ix-halo"></i><div class="ix-phone"><div class="ix-screen">' +
    '<div class="ix-boot">' + OBJETS.piece + '<span class="ix-bar"><i></i></span></div>' +
    '<div class="ix-home"><span class="ix-status">10:00</span><div class="ix-apps">' + APPS.map(appli).join('') + '</div>' +
    '<div class="ix-dock">' + DOCK.map(function (a, i) { return appli(a, i + 16); }).join('') + '</div></div>' +
    '<i class="ix-island"></i></div></div>';

  // Scène 1 : ordinateurs portables qui s'ouvrent en éventail, tablettes devant.
  var PORTABLES = [
    ['#d6d8dc', '#f3f4f6', -34, 'linear-gradient(135deg,#a8c0ff,#3f2b96)', 0],
    ['#ecbcc4', '#fbe7ea', -12, 'linear-gradient(135deg,#ff9a8b,#ff6a88 55%,#ff99ac)', 90],
    ['#e6df6e', '#f8f5cf', 12, 'linear-gradient(135deg,#f6d365,#fda085)', 180],
    ['#2e3b58', '#cfd5e2', 34, 'linear-gradient(135deg,#43cea2,#185a9d)', 270],
  ];
  var TABLETTES = [['#6f7076', -26], ['#c6dde3', -13], ['#e7dcc8', 0], ['#dcd2e8', 13], ['', 26]];
  var scene1 = '<div class="ix-fan">' + PORTABLES.map(function (l) {
    return '<div class="ix-lpw" style="--c:' + l[0] + ';--c2:' + l[1] + ';--rz:' + l[2] + 'deg;--wp:' + l[3] + ';--dl:' + l[4] + 'ms">' +
      '<div class="ix-cam"><div class="ix-lp"><div class="ix-lp-base"><i class="kb"></i><i class="tp"></i></div>' +
      '<div class="ix-lp-lid"><i class="scr"></i></div></div></div></div>';
  }).join('') + '</div><div class="ix-fan2">' + TABLETTES.map(function (t, i) {
    return '<div class="ix-tab' + (t[0] ? '' : ' ix-tab-front') + '" style="--c:' + (t[0] || '#111') + ';--r:' + t[1] + 'deg;--dl:' + i * 60 + 'ms"><i></i></div>';
  }).join('') + '</div>';

  // Scène 2 : console de salon blanche, manette, console portable rétro et boîtiers de jeux.
  var console2 = '<svg viewBox="0 0 60 172"><defs><linearGradient id="ix-wh" x1="0" x2="1"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#eceef2"/><stop offset="1" stop-color="#c9cdd4"/></linearGradient></defs>' +
    '<rect x="22" y="8" width="16" height="152" rx="3" fill="#15171c"/>' +
    '<path d="M24 4C12 4 5 30 5 86s7 82 19 82z" fill="url(#ix-wh)"/><path d="M36 4c12 0 19 26 19 82s-7 82-19 82z" fill="url(#ix-wh)"/>' +
    '<path d="M24 4C12 4 5 30 5 86s7 82 19 82z" fill="url(#ix-sheen)"/>' +
    '<rect x="27" y="120" width="6" height="2" rx="1" fill="#8a9099"/><rect x="27" y="126" width="6" height="2" rx="1" fill="#8a9099"/>' +
    '<rect x="14" y="166" width="32" height="5" rx="2.5" fill="#b9bec6"/></svg>';
  var manette2 = '<svg viewBox="0 0 120 80"><path d="M28 8h64c16 0 26 10 27 26l1 18c1 14-14 22-23 12l-8-9H31l-8 9c-9 10-24 2-23-12l1-18C2 18 12 8 28 8z" fill="#f4f5f7"/>' +
    '<path d="M38 12h44v20a6 6 0 0 1-6 6H44a6 6 0 0 1-6-6z" fill="#e3e6ea"/><path d="M34 44h52l-6 9H40z" fill="#16181d"/>' +
    '<circle cx="44" cy="50" r="8" fill="#16181d"/><circle cx="44" cy="50" r="5" fill="#2c3037"/><circle cx="76" cy="50" r="8" fill="#16181d"/><circle cx="76" cy="50" r="5" fill="#2c3037"/>' +
    '<path d="M16 30h12M22 24v12" stroke="#2c3037" stroke-width="4" stroke-linecap="round"/>' +
    '<circle cx="98" cy="23" r="3.2" fill="#9aa1ab"/><circle cx="105" cy="30" r="3.2" fill="#9aa1ab"/><circle cx="91" cy="30" r="3.2" fill="#9aa1ab"/><circle cx="98" cy="37" r="3.2" fill="#9aa1ab"/>' +
    '<path d="M28 8h64c16 0 26 10 27 26l1 18c1 14-14 22-23 12l-8-9H31l-8 9c-9 10-24 2-23-12l1-18C2 18 12 8 28 8z" fill="url(#ix-sheen)"/></svg>';
  var JEUX = [['#e4002b', 'radial-gradient(45% 35% at 30% 65%,#ffd23f,transparent 70%),radial-gradient(50% 40% at 75% 40%,#3ec1ff,transparent 70%),linear-gradient(170deg,#7ee081,#2a9d5c)', -16],
    ['#1a1a1d', 'radial-gradient(40% 35% at 50% 55%,#ff5f5f,transparent 70%),radial-gradient(60% 50% at 30% 30%,#8e7cff,transparent 70%),linear-gradient(160deg,#2b2b45,#121226)', 0],
    ['#e4002b', 'radial-gradient(50% 40% at 60% 60%,#ff9f1c,transparent 70%),radial-gradient(45% 40% at 30% 35%,#ff4fa3,transparent 70%),linear-gradient(170deg,#ffe066,#ff8c42)', 16]];
  var scene2 = '<div class="ix-gb ix-pop">' + OBJETS.retro + '</div><div class="ix-cons ix-pop">' + console2 + '</div>' +
    '<div class="ix-pad ix-pop">' + manette2 + '</div><div class="ix-cases">' + JEUX.map(function (j, i) {
      return '<span class="ix-case" style="--h:' + j[0] + ';--art:' + j[1] + ';--r:' + j[2] + 'deg;--dl:' + i * 90 + 'ms"><i></i></span>';
    }).join('') + '</div>';

  // Scène 3 : perceuse-visseuse sans fil, mèche en rotation, étincelles.
  var stries = '';
  for (var x = -6; x < 66; x += 6) stries += '<path d="M' + x + ' 71l6 8" stroke="#6c727c" stroke-width="2"/>';
  var etincelles = '';
  [[-14, -10], [-18, 4], [-12, 12], [-20, -2], [-10, -14]].forEach(function (p, i) {
    etincelles += '<circle class="sp" cx="2" cy="75" r="1.6" fill="#ffd27a" style="--sx:' + p[0] + 'px;--sy:' + p[1] + 'px;--dl:' + i * 90 + 'ms"/>';
  });
  var scene3 = '<div class="ix-drill"><svg viewBox="0 0 220 200"><defs>' +
    '<linearGradient id="ix-chrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f3f5"/><stop offset=".5" stop-color="#9aa1aa"/><stop offset="1" stop-color="#e2e5e9"/></linearGradient>' +
    '<clipPath id="ix-bitclip"><rect x="6" y="71" width="56" height="8" rx="2"/></clipPath></defs>' +
    '<rect x="6" y="71" width="56" height="8" rx="2" fill="#c3c8cf"/><g clip-path="url(#ix-bitclip)"><g class="bit">' + stries + '</g></g>' +
    '<path d="M6 71L0 75l6 4z" fill="#9aa0a8"/>' + etincelles +
    '<rect x="60" y="60" width="36" height="30" rx="5" fill="url(#ix-chrome)"/><path d="M68 62v26M76 62v26M84 62v26" stroke="#7d848d" stroke-width="1.4"/>' +
    '<rect x="94" y="56" width="12" height="38" rx="3" fill="#1c1f22"/>' +
    '<path d="M104 48h78c10 0 18 8 18 18v16c0 10-8 18-18 18h-78z" fill="#2f6d4c"/><path d="M104 48h78c10 0 18 8 18 18v4H104z" fill="#245a3d"/>' +
    '<rect x="120" y="66" width="48" height="18" rx="4" fill="#1d2b24"/><path d="M176 72h16M176 78h16M176 84h16" stroke="#1d2b24" stroke-width="2.4" stroke-linecap="round"/>' +
    '<path d="M128 100l-10 58c-1 8 3 10 9 10h23c7 0 10-3 9-10l4-58z" fill="#1b1d20"/><path d="M133 108l-7 44h22l4-44z" fill="#2f6d4c" opacity=".55"/>' +
    '<path d="M118 104c-6 2-7 9-6 14l7 10 6-22z" fill="#c8453c"/>' +
    '<rect x="102" y="164" width="86" height="32" rx="7" fill="#1b1d20"/><rect x="102" y="176" width="86" height="6" fill="#2f6d4c"/>' +
    '<circle cx="174" cy="189" r="1.8" fill="#7fd67f"/><circle cx="180" cy="189" r="1.8" fill="#7fd67f"/>' +
    '<path d="M104 48h78c10 0 18 8 18 18v16c0 10-8 18-18 18h-78z" fill="url(#ix-sheen)"/></svg></div>';

  // Scène 4 : diamant et sac en trait doré, chronographe noir et or, montre acier cadran vert.
  var trace = function (cls, vb, traits) {
    return '<svg class="ix-line ' + cls + '" viewBox="' + vb + '">' + traits.map(function (d, i) {
      return '<path pathLength="1" style="--dl:' + i * 90 + 'ms" d="' + d + '"/>';
    }).join('') + '</svg>';
  };
  var diamant = trace('ix-diam', '0 0 100 100', ['M35 20H65L85 34L50 82L15 34Z', 'M15 34H85', 'M15 34L35 20L32.5 34L50 20L67.5 34L65 20L85 34',
    'M32.5 34L50 82L67.5 34', 'M15 34L41 58M85 34L59 58M50 34V82']);
  var sac = trace('ix-bag', '0 0 100 90', ['M14 36H86L92 84H8Z', 'M34 36C34 10 66 10 66 36', 'M11 50H89',
    'M46 50H54V60H46Z', 'M47.5 50V46.5A2.5 2.5 0 0 1 52.5 46.5V50', 'M20 36L16 84M80 36L84 84']);
  var graduations = function (r1, r2, n, couleur, larg) {
    var out = '';
    for (var k = 0; k < n; k++) {
      var an = k * 2 * Math.PI / n, c = Math.cos(an), s = Math.sin(an);
      out += '<path d="M' + (50 + r1 * c).toFixed(2) + ' ' + (80 + r1 * s).toFixed(2) + 'L' + (50 + r2 * c).toFixed(2) + ' ' + (80 + r2 * s).toFixed(2) + '" stroke="' + couleur + '" stroke-width="' + larg + '"/>';
    }
    return out;
  };
  var aiguilles = function (c1, c2) {
    return '<g class="hd"><path d="M50 80V62" stroke="' + c1 + '" stroke-width="2.6" stroke-linecap="round"/></g>' +
      '<g class="hd hd2"><path d="M50 80L66 70" stroke="' + c1 + '" stroke-width="1.8" stroke-linecap="round"/></g>' +
      '<g class="sec"><path d="M50 86V56" stroke="' + c2 + '" stroke-width=".8" stroke-linecap="round"/></g><circle cx="50" cy="80" r="1.8" fill="' + c1 + '"/>';
  };
  var chrono = '<svg viewBox="0 0 100 160"><defs><radialGradient id="ix-champ"><stop offset="0" stop-color="#ecd29a"/><stop offset="1" stop-color="#b98c43"/></radialGradient></defs>' +
    '<path d="M33 0h34l-2 50H35z" fill="#1d1d1f"/><path d="M35 110h30l2 50H33z" fill="#1d1d1f"/>' +
    '<path d="M37 4v40M63 4v40M37 116v40M63 116v40" stroke="#c9a35a" stroke-width=".7" stroke-dasharray="2 2"/>' +
    '<rect x="85" y="64" width="6" height="7" rx="1.5" fill="#d4ab5c"/><rect x="85" y="76" width="7" height="8" rx="1.5" fill="#d4ab5c"/><rect x="85" y="89" width="6" height="7" rx="1.5" fill="#d4ab5c"/>' +
    '<circle cx="50" cy="80" r="37" fill="#111113"/><circle cx="50" cy="80" r="33" fill="none" stroke="#232326" stroke-width="7"/>' +
    graduations(30.5, 35, 60, '#c9a35a', .6) + '<circle cx="50" cy="80" r="27" fill="url(#ix-champ)"/>' +
    '<circle cx="50" cy="68" r="7" fill="#c49b52" stroke="#9c7a3c" stroke-width=".6"/><circle cx="39" cy="86" r="7" fill="#c49b52" stroke="#9c7a3c" stroke-width=".6"/><circle cx="61" cy="86" r="7" fill="#c49b52" stroke="#9c7a3c" stroke-width=".6"/>' +
    graduations(22, 25.5, 12, '#5a4220', 1.3) + aiguilles('#2a2118', '#2a2118') +
    '<circle cx="50" cy="80" r="37" fill="url(#ix-sheen)"/></svg>';
  var acier = '<svg viewBox="0 0 100 160"><defs><linearGradient id="ix-steel" x1="0" x2="1"><stop offset="0" stop-color="#8d939b"/><stop offset=".35" stop-color="#f2f4f6"/><stop offset=".65" stop-color="#b9bfc6"/><stop offset="1" stop-color="#eef1f4"/></linearGradient>' +
    '<radialGradient id="ix-green" cx=".4" cy=".35"><stop offset="0" stop-color="#4f9a74"/><stop offset="1" stop-color="#173f2c"/></radialGradient></defs>' +
    '<path d="M34 0h32l-2 52H36z" fill="url(#ix-steel)"/><path d="M36 108h28l2 52H34z" fill="url(#ix-steel)"/>' +
    '<path d="M35 8h30M35 16h30M35 24h30M35 32h30M35 40h30M36 116h28M35 124h30M35 132h30M35 140h30M35 148h30M44 0v52M56 0v52M44 108v52M56 108v52" stroke="#7e858e" stroke-width=".7"/>' +
    '<rect x="82" y="76" width="7" height="8" rx="1.5" fill="url(#ix-steel)"/>' +
    '<circle cx="50" cy="80" r="34" fill="url(#ix-steel)"/><circle cx="50" cy="80" r="30" fill="none" stroke="#8d939b" stroke-width="5"/>' +
    '<circle cx="50" cy="80" r="30" fill="none" stroke="#f4f6f8" stroke-width="5" stroke-dasharray=".9 .9"/>' +
    '<circle cx="50" cy="80" r="26" fill="url(#ix-green)"/>' + graduations(20, 24.5, 12, '#f1f3f5', 1.6) +
    '<rect x="66" y="76.5" width="9" height="7" rx=".8" fill="#fff"/><text x="70.5" y="82.2" text-anchor="middle" font-family="Arial,sans-serif" font-size="5.6" font-weight="700" fill="#111">28</text>' +
    aiguilles('#f1f3f5', '#f1f3f5') + '<circle cx="50" cy="80" r="34" fill="url(#ix-sheen)"/></svg>';
  var scene5 = '<i class="ix-glow"></i>' + diamant + '<i class="ix-spark"></i>' + sac +
    '<div class="ix-w ix-w1 ix-pop">' + chrono + '</div><div class="ix-w ix-w2 ix-pop">' + acier + '</div>';

  // Déroulé : [scène, début (s), durée (s), légende]
  var SCENES = [
    [scene0, .35, 1.9, 'Téléphonie'], [scene1, 2.05, 1.35, 'Informatique &amp; tablettes'],
    [scene2, 3.15, 1.3, 'Consoles &amp; jeux vidéo'], [scene3, 4.2, 1.15, 'Outillage pro'],
    [scene5, 5.1, 1.5, 'Luxe : montres, sacs &amp; bijoux'],
  ];
  var FIN = 7450;

  var html = '<div class="ix" id="intro" role="presentation" aria-hidden="true">' +
    '<svg width="0" height="0" style="position:absolute"><defs>' +
      '<linearGradient id="ix-wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1f6b3a"/><stop offset=".55" stop-color="#2f8f52"/><stop offset="1" stop-color="#e8b530"/></linearGradient>' +
      '<linearGradient id="ix-sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>' +
      '<linearGradient id="ix-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3c4"/><stop offset=".5" stop-color="#e8b530"/><stop offset="1" stop-color="#b9851a"/></linearGradient>' +
    '</defs></svg>' +
    '<div class="ix-vortex"><i class="ix-ring r1"></i><i class="ix-ring r2"></i><i class="ix-ring r3"></i><i class="ix-streaks"></i><i class="ix-core"></i></div>' +
    '<div class="ix-objets">' + particules + '</div>' +
    SCENES.map(function (sc, i) {
      return '<div class="ix-scene ix-s' + i + '" style="--t0:' + sc[1] + 's;--du:' + sc[2] + 's">' + sc[0] + '<span class="ix-cap">' + sc[3] + '</span></div>';
    }).join('') +
    '<div class="ix-logo"><img src="paytoocash-logo/logo.svg" alt=""><i></i></div>' +
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
  var timer = setTimeout(terminer, FIN);
  el.addEventListener('click', function () { clearTimeout(timer); terminer(); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { clearTimeout(timer); terminer(); } });
})();
