(function () {
  'use strict';

  var products = [];
  var form = document.getElementById('product-form');
  var editor = document.getElementById('editor');
  var preview = document.getElementById('image-preview');
  var euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function dateFr(iso) { return iso ? iso.split('-').reverse().join('/') : ''; }

  function api(action, body) {
    return fetch('api.php?action=' + action, {
      method: 'POST',
      headers: { 'X-CSRF-Token': window.CSRF },
      body: body || null
    }).then(function (r) {
      return r.json().catch(function () { return { error: 'Réponse inattendue du serveur.' }; })
        .then(function (data) {
          if (r.status === 401) { location.reload(); }
          if (data.error) throw new Error(data.error);
          return data;
        });
    });
  }

  // ---------- Liste ----------

  function load() {
    return api('list').then(function (data) {
      products = data.products;
      render();
    }).catch(function (e) {
      document.getElementById('list-error').textContent = e.message;
    });
  }

  function render() {
    var rows = document.getElementById('product-rows');
    if (!products.length) {
      rows.innerHTML = '<tr><td colspan="5">Aucun produit. Clique sur « Ajouter un produit ».</td></tr>';
    } else {
      rows.innerHTML = products.map(function (p) {
        var type = p.preorder
          ? '<span class="badge preorder">Précommande · ' + dateFr(p.release_date) + '</span>'
          : '<span class="badge ok">En stock</span>';
        if (p.featured) type += ' <span class="badge gold">★ Meilleure vente</span>';
        return '<tr>' +
          '<td><div class="cell-product"><img src="../' + escapeHtml(p.image) + '" alt="">' +
          '<div><strong>' + escapeHtml(p.name) + '</strong><div class="muted small">' + escapeHtml(p.category) + '</div></div></div></td>' +
          '<td>' + euro.format(p.price / 100) + '</td>' +
          '<td class="' + (p.stock <= 0 ? 'out' : p.stock <= 3 ? 'low' : '') + '">' + p.stock + '</td>' +
          '<td>' + type + '</td>' +
          '<td class="row-actions">' +
          '<button class="button ghost small-btn" data-edit="' + escapeHtml(p.id) + '">Modifier</button>' +
          '<button class="button danger small-btn" data-delete="' + escapeHtml(p.id) + '">Supprimer</button>' +
          '</td></tr>';
      }).join('');
    }
    var categories = [];
    products.forEach(function (p) { if (p.category && categories.indexOf(p.category) < 0) categories.push(p.category); });
    document.getElementById('categories').innerHTML = categories.map(function (c) {
      return '<option value="' + escapeHtml(c) + '">';
    }).join('');
  }

  // ---------- Formulaire ----------

  function togglePreorder() {
    var on = form.elements.preorder.checked;
    document.getElementById('release-field').hidden = !on;
    form.elements.release_date.required = on;
  }

  function openEditor(product) {
    form.reset();
    document.getElementById('form-error').textContent = '';
    var p = product || {};
    document.getElementById('editor-title').textContent = product ? 'Modifier le produit' : 'Nouveau produit';
    form.elements.id.value = p.id || '';
    form.elements.name.value = p.name || '';
    form.elements.price.value = p.price ? (p.price / 100).toFixed(2).replace('.', ',') : '';
    form.elements.stock.value = p.stock != null ? p.stock : 0;
    form.elements.stock_loaded.value = p.stock != null ? p.stock : 0;
    form.elements.preorder.checked = !!p.preorder;
    form.elements.release_date.value = p.release_date || '';
    form.elements.category.value = p.category || '';
    form.elements.max_per_order.value = p.max_per_order || 5;
    form.elements.description.value = p.description || '';
    form.elements.featured.checked = !!p.featured;
    preview.src = '../' + (p.image || 'assets/img/produit.svg');
    togglePreorder();
    editor.showModal();
    form.elements.name.focus();
  }

  form.elements.preorder.addEventListener('change', togglePreorder);
  form.elements.image.addEventListener('change', function () {
    var file = form.elements.image.files[0];
    if (file) preview.src = URL.createObjectURL(file);
  });
  document.getElementById('cancel').addEventListener('click', function () { editor.close(); });
  document.getElementById('new-product').addEventListener('click', function () { openEditor(null); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var save = document.getElementById('save');
    save.disabled = true;
    save.textContent = 'Enregistrement…';
    api('save', new FormData(form))
      .then(function () { editor.close(); return load(); })
      .catch(function (err) { document.getElementById('form-error').textContent = err.message; })
      .then(function () { save.disabled = false; save.textContent = 'Enregistrer'; });
  });

  document.getElementById('product-rows').addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    var id = btn.dataset.edit || btn.dataset.delete;
    var product = products.find(function (p) { return p.id === id; });
    if (!product) return;
    if (btn.dataset.edit) {
      openEditor(product);
    } else if (confirm('Supprimer « ' + product.name + ' » ? Cette action est définitive.')) {
      var body = new FormData();
      body.append('id', id);
      api('delete', body).then(load).catch(function (err) { alert(err.message); });
    }
  });

  load();
})();
