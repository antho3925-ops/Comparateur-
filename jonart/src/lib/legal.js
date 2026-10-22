// Outils pour les pages légales : surligne les placeholders "[À COMPLÉTER …]" / "[À VÉRIFIER …]".
export const mark = (html) => html.replace(/\[(À (?:COMPLÉTER|VÉRIFIER)[^\]]*)\]/g, '<mark class="todo">[$1]</mark>');
