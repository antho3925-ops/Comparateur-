import { loadData } from './store.js';
import { initPage, finishPage } from './layout.js';

initPage('');
finishPage(await loadData());
