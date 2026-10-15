(function () {
  'use strict';

  var state = { products: [], shipping: null, paymentsEnabled: false, filter: 'all', cart: loadCart(), checkoutError: '' };
  var euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

  function $(id) { return document.getElementById(id); }
  function money(cents) { return euro.format(cents / 100); }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function dateFr(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    return p[2] + '/' + p[1] + '/' + p[0];
  }

  function loadCart() {
    try { return JSON.parse(localStorage.getItem('cart')) || {}; } catch (e) { return {}; }
  }
  function saveCart() {
    try { localStorage.setItem('cart', JSON.stringify(state.cart)); } catch (e) {}
  }
  function findProduct(id) {
    return state.products.find(function (p) { return p.id === id; });
  }
  function maxQty(p) { return Math.min(p.stock, p.max_per_order); }

  // ---------- Catalogue ----------

  function renderFilters() {
    var categories = [];
    state.products.forEach(function (p) {
      if (p.category && categories.indexOf(p.category) === -1) categories.push(p.category);
    });
    var filters = [['all', 'Tout'], ['instock', 'En stock'], ['preorder', 'Précommandes']]
      .concat(categories.map(function (c) { return ['cat:' + c, c]; }));
    $('filters').innerHTML = filters.map(function (f) {
      return '<button class="chip" data-filter="' + escapeHtml(f[0]) + '" aria-pressed="' +
        (state.filter === f[0]) + '">' + escapeHtml(f[1]) + '</button>';
    }).join('');
  }

  function matchesFilter(p) {
    if (state.filter === 'instock') return !p.preorder && p.stock > 0;
    if (state.filter === 'preorder') return p.preorder;
    if (state.filter.indexOf('cat:') === 0) return p.category === state.filter.slice(4);
    return true;
  }

  function badge(p) {
    if (p.stock <= 0) return '<span class="badge out">' + (p.preorder ? 'Précommandes complètes' : 'Rupture de stock') + '</span>';
    if (p.preorder) return '<span class="badge preorder">Précommande · sortie le ' + dateFr(p.release_date) + '</span>';
    if (p.stock <= 3) return '<span class="badge low">Plus que ' + p.stock + ' en stock</span>';
    return '<span class="badge ok">En stock</span>';
  }

  function renderProducts() {
    var list = state.products.filter(matchesFilter);
    if (!list.length) {
      $('products').innerHTML = '<p class="muted">Aucun produit dans cette catégorie pour le moment.</p>';
      return;
    }
    $('products').innerHTML = list.map(function (p) {
      var inCart = state.cart[p.id] || 0;
      var full = inCart >= maxQty(p);
      var label = p.stock <= 0 ? 'Indisponible' : full ? 'Maximum atteint' : p.preorder ? 'Précommander' : 'Ajouter au panier';
      return '<article class="card">' +
        '<img src="' + escapeHtml(p.image) + '" alt="' + escapeHtml(p.name) + '" loading="lazy">' +
        '<div class="card-body">' + badge(p) +
        '<h3>' + escapeHtml(p.name) + '</h3>' +
        '<p>' + escapeHtml(p.description) + '</p>' +
        '<div class="price">' + money(p.price) + '</div>' +
        '<button class="button' + (p.preorder ? ' preorder' : '') + '" data-add="' + escapeHtml(p.id) + '"' +
        (p.stock <= 0 || full ? ' disabled' : '') + '>' + label + '</button>' +
        '</div></article>';
    }).join('');
  }

  // ---------- Panier ----------

  function cartLines() {
    return Object.keys(state.cart).map(function (id) {
      return { product: findProduct(id), qty: state.cart[id] };
    }).filter(function (l) { return l.product; });
  }

  function renderCart() {
    var lines = cartLines();
    var count = lines.reduce(function (n, l) { return n + l.qty; }, 0);
    $('cart-count').textContent = count;

    if (!lines.length) {
      $('cart-lines').innerHTML = '<p class="muted">Votre panier est vide.</p>';
      $('cart-summary').innerHTML = '';
      return;
    }

    $('cart-lines').innerHTML = lines.map(function (l) {
      var p = l.product;
      return '<div class="line">' +
        '<div><div class="line-name">' + escapeHtml(p.name) + '</div>' +
        '<div class="muted small">' + money(p.price) + ' l’unité</div></div>' +
        '<div><strong>' + money(p.price * l.qty) + '</strong></div>' +
        '<div class="qty">' +
        '<button data-dec="' + escapeHtml(p.id) + '" aria-label="Retirer un">−</button>' +
        '<span>' + l.qty + '</span>' +
        '<button data-inc="' + escapeHtml(p.id) + '" aria-label="Ajouter un"' + (l.qty >= maxQty(p) ? ' disabled' : '') + '>+</button>' +
        '</div>' +
        '<div><button class="remove" data-remove="' + escapeHtml(p.id) + '">Retirer</button></div>' +
        (p.preorder ? '<div class="line-note">Précommande : expédié à la sortie, le ' + dateFr(p.release_date) + '</div>' : '') +
        '</div>';
    }).join('');

    var subtotal = lines.reduce(function (s, l) { return s + l.product.price * l.qty; }, 0);
    var sh = state.shipping;
    var free = sh.free_from > 0 && subtotal >= sh.free_from;
    var shipping = free ? 0 : sh.price;
    var hint = !free && sh.free_from > 0
      ? '<p class="muted small">Plus que ' + money(sh.free_from - subtotal) + ' pour la livraison offerte.</p>' : '';

    $('cart-summary').innerHTML =
      '<div class="totals">' +
      '<div><span>Sous-total</span><span>' + money(subtotal) + '</span></div>' +
      '<div><span>Livraison (' + escapeHtml(sh.label) + ')</span><span>' + (free ? 'Offerte' : money(shipping)) + '</span></div>' +
      '<div class="grand"><span>Total TTC</span><span>' + money(subtotal + shipping) + '</span></div>' +
      '</div>' + hint +
      '<label class="terms"><input type="checkbox" id="accept-terms"> <span>J’accepte les <a href="cgv.html" target="_blank">conditions générales de vente</a>, y compris les conditions de précommande.</span></label>' +
      '<button class="button block" id="checkout"' + (state.paymentsEnabled ? '' : ' disabled') + '>' +
      (state.paymentsEnabled ? 'Payer ' + money(subtotal + shipping) : 'Paiement bientôt disponible') + '</button>' +
      '<p class="muted small">Carte bancaire, Apple Pay ou Google Pay – paiement sécurisé par Stripe.</p>' +
      '<p class="error" id="checkout-error" role="alert">' + escapeHtml(state.checkoutError) + '</p>';
  }

  function changeQty(id, delta) {
    var p = findProduct(id);
    if (!p) return;
    var qty = Math.max(0, Math.min((state.cart[id] || 0) + delta, maxQty(p)));
    if (qty === 0) delete state.cart[id]; else state.cart[id] = qty;
    state.checkoutError = '';
    saveCart();
    renderCart();
    renderProducts();
  }

  function openCart() { $('cart').hidden = false; }
  function closeCart() { $('cart').hidden = true; }

  function checkout() {
    var error = $('checkout-error');
    state.checkoutError = '';
    error.textContent = '';
    if (!$('accept-terms').checked) {
      error.textContent = 'Merci d’accepter les conditions générales de vente.';
      return;
    }
    var button = $('checkout');
    button.disabled = true;
    button.textContent = 'Redirection vers le paiement…';

    var items = cartLines().map(function (l) { return { id: l.product.id, qty: l.qty }; });
    fetch('api/checkout.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: items })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.url) { window.location.href = data.url; return; }
        throw new Error(data.error || 'Erreur inconnue');
      })
      .catch(function (e) {
        // Recharge le stock réel : le panier s'ajuste et le message reste affiché.
        state.checkoutError = e.message || 'Connexion impossible, réessayez.';
        loadProducts();
      });
  }

  // ---------- Évènements ----------

  document.addEventListener('click', function (e) {
    var t = e.target.closest('button, .drawer');
    if (!t) return;
    if (t.dataset.filter) { state.filter = t.dataset.filter; renderFilters(); renderProducts(); }
    else if (t.dataset.add) { changeQty(t.dataset.add, 1); openCart(); }
    else if (t.dataset.inc) changeQty(t.dataset.inc, 1);
    else if (t.dataset.dec) changeQty(t.dataset.dec, -1);
    else if (t.dataset.remove) changeQty(t.dataset.remove, -Infinity);
    else if (t.id === 'open-cart') openCart();
    else if (t.id === 'close-cart') closeCart();
    else if (t.id === 'checkout') checkout();
    else if (t.id === 'cart' && e.target === t) closeCart();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCart(); });

  // ---------- Chargement ----------

  function loadProducts() {
    return fetch('api/products.php', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        state.products = data.products;
        state.shipping = data.shipping;
        state.paymentsEnabled = data.payments_enabled;
        document.querySelectorAll('.shop-name').forEach(function (el) { el.textContent = data.shop_name; });
        document.title = data.shop_name + ' – Cartes à collectionner';
        $('payments-notice').hidden = data.payments_enabled;

        // Ajuste le panier au stock réel (produit retiré, stock baissé…).
        Object.keys(state.cart).forEach(function (id) {
          var p = findProduct(id);
          var max = p ? maxQty(p) : 0;
          if (max <= 0) delete state.cart[id];
          else if (state.cart[id] > max) state.cart[id] = max;
        });
        saveCart();
        renderFilters();
        renderProducts();
        renderCart();
      })
      .catch(function () {
        $('products').innerHTML = '<p class="error">Impossible de charger les produits. Rechargez la page.</p>';
      });
  }

  loadProducts().then(function () {
    if (location.hash === '#panier' && cartLines().length) openCart();
  });
})();
