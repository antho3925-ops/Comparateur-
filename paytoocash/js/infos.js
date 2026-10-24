// Bloc « Infos pratiques » : adresse, contact, horaires.

import { icon, facebookLogo } from './icons.js';
import { esc, pub, telHref, mapsHref, facebookHref, statutOuverture, plageTexte, cap } from './util.js';

export function infosPratiques(b) {
  const statut = statutOuverture(b.horaires);
  const note = pub(b.horaires_note);
  return `
    <section class="section infos" id="infos">
      <div class="wrap infos-grid">
        <div class="reveal">
          <h2 class="h2">Infos pratiques</h2>
          <p class="lead">${esc(pub(b.atout) || 'Magasin')} à Pontarlier : venez voir, essayer et repartir avec votre article.</p>
          <ul class="info-list">
            <li class="anim-icon"><span class="info-ico">${icon('pin')}</span><div><strong>Adresse</strong><br>${esc(b.adresse)}</div></li>
            <li class="anim-icon"><span class="info-ico">${icon('phone')}</span><div><strong>Téléphone</strong><br><a href="${telHref(b.tel)}">${esc(b.tel)}</a></div></li>
            ${b.email ? `<li class="anim-icon"><span class="info-ico">${icon('mail')}</span><div><strong>E-mail</strong><br><a href="mailto:${esc(b.email)}">${esc(b.email)}</a></div></li>` : ''}
            ${b.facebook ? `<li class="anim-icon"><span class="info-ico info-ico-fb">${facebookLogo()}</span><div><strong>Facebook</strong><br><a href="${esc(facebookHref(b.facebook))}" target="_blank" rel="noopener">${esc(b.facebook)}</a></div></li>` : ''}
          </ul>
          <div class="btn-row">
            <a class="btn btn-green" href="${telHref(b.tel)}">${icon('phone')}Appeler le magasin</a>
            <a class="btn btn-outline" href="${mapsHref(b.adresse)}" target="_blank" rel="noopener">${icon('pin')}Itinéraire Google Maps</a>
          </div>
        </div>
        <div class="hours reveal">
          <h3 class="hours-title">${icon('clock')}Horaires</h3>
          ${statut ? `<p class="open-status ${statut.ouvert ? 'is-open' : 'is-closed'}"><span class="dot"></span>${esc(statut.texte)}</p>` : ''}
          <table class="hours-table">
            ${b.horaires.map((h, i) => `<tr${statut && statut.jour === i ? ' class="today"' : ''}><th>${cap(h.jour)}</th><td>${plageTexte(h)}</td></tr>`).join('')}
          </table>
          ${note ? `<p class="hours-note">${esc(note)}</p>` : ''}
        </div>
      </div>
    </section>`;
}
