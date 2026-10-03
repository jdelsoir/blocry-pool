/* Blocry Pool, unofficial lane availability app. Vanilla JS, no build step.
   Loaded without defer from <head>: the theme block below runs before first paint,
   the rest of the app boots once the DOM is parsed. */
'use strict';

/* Theme: 'light' | 'dark' forced via data-theme on <html>, absent = follow the system. */
const THEME_KEY = 'blocry-pool-theme';
const THEME_COLOR = { light: '#FFFFFF', dark: '#1D2327' };
function readTheme() {
  try { const v = localStorage.getItem(THEME_KEY); return v === 'light' || v === 'dark' ? v : 'auto'; } catch (e) { return 'auto'; }
}
function applyTheme(mode) {
  const root = document.documentElement;
  if (mode === 'light' || mode === 'dark') root.setAttribute('data-theme', mode); else root.removeAttribute('data-theme');
  /* The two theme-color metas carry media queries for Auto; a forced theme pins both to its colour. */
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
    const sys = /dark/.test(m.getAttribute('media') || '') ? 'dark' : 'light';
    m.setAttribute('content', THEME_COLOR[mode === 'auto' ? sys : mode]);
  });
}
applyTheme(readTheme());

function boot() {

/* i18n */
const I18N = {
  fr: {
    days: ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'],
    months: ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'],
    agenda: 'Agenda', week: 'Semaine', menu: 'Menu', lang: 'Langue', loading: 'Chargement...',
    open: 'Ouvert', closed: 'Fermé', pause: 'Pause', lanes: 'couloirs',
    setupUntil: "Cette configuration jusqu'à", poolUntil: "piscine ouverte jusqu'à",
    opensAt: "Prochaine ouverture aujourd'hui à", reopensAt: 'Reprise à',
    noSession: "Plus de séance aujourd'hui.", noToday: "Pas d'horaire publié pour aujourd'hui.",
    startsOn: 'Le premier horaire publié commence le',
    nextMatch: 'Prochaine séance', now: 'Maintenant', nowLc: 'en ce moment', until: "jusqu'à",
    noMatch: 'Aucune séance ne correspond dans les semaines publiées.',
    pool: 'Bassin', when: 'Quand', lenAny: '25m et 50m', len25: '25m', len50: '50m', both: 'Les deux',
    band: { all: 'Toute la journée', morning: 'Matin', lunch: 'Midi 12-14h', afternoon: 'Après-midi 14-18h', evening: 'Soir 18h+' },
    bandShort: { all: 'Toute la journée', morning: 'Matin', lunch: 'Midi', afternoon: 'Après-midi', evening: 'Soir' },
    pauseGeneric: 'Pause, changement de configuration',
    pauseLong: "Les sauveteurs demandent de sortir de l'eau pendant le changement.",
    noneDay: 'Aucune séance pour ce filtre ce jour-là.', closedDay: 'Piscine fermée', to: 'à',
    sessionsOf: 'Séances du',
    updated: 'Horaire mis à jour', justNow: "à l'instant",
    source: 'Source', unofficial: 'non officiel',
    plan: 'Plan indicatif, 25m publics à droite', closedAt: 'Piscine fermée à cette heure.',
    sameSetup: 'Même configuration pendant tout le bloc.',
    suspect: "Chiffre douteux dans l'horaire source",
    legend: 'Plus foncé = plus de couloirs.', legClosed: 'fermé', legChg: 'changement',
    close: 'Fermer', prev: 'Semaine précédente', next: 'Semaine suivante', nextOpen: 'Prochaines séances',
    pickDay: 'Choisir un jour',
    notPublished: "Le prochain horaire n'est pas encore publié",
    lastPublished: 'Dernier horaire publié', seeLastWeek: 'Voir la dernière semaine',
    offline: 'Hors ligne, données du', loadError: "Impossible de charger l'horaire.", retry: 'Réessayer',
    weekShort: 'Semaine du',
    colon: ' : ', home: 'Accueil', about: 'À propos', appName: 'Horaire Piscine Blocry', locale: 'fr-BE',
    restToday: "Encore aujourd'hui",
    nextOpening: 'Prochaine ouverture', seeInAgenda: "Voir ce jour dans l'agenda",
    noNextOpening: 'Aucune autre ouverture dans les semaines publiées.',
    theme: 'Thème', themeName: { auto: 'automatique', light: 'clair', dark: 'sombre' }, themeNext: 'Appuyer pour passer en',
    pool_: 'La piscine', country: 'Belgique', phone: 'Téléphone', call: 'Appeler',
    map: 'Voir sur la carte (OpenStreetMap)', officialSite: 'Site officiel',
    discTitle: 'Projet personnel, non officiel',
    disc: "Cette application est un projet personnel, réalisé par passion. Elle n'est ni affiliée, ni approuvée, ni gérée par le Centre sportif de Blocry ou l'UCLouvain.",
    discCheck: 'Pour les informations officielles, les fermetures et les tarifs, consultez toujours le site officiel.',
    howTitle: 'Comment ça marche',
    how: ['Le nombre de couloirs vient du tableau publié par la piscine, relu quatre fois par jour.',
      'Le plan du bassin est indicatif.', 'Les chiffres peuvent changer à court terme.'],
    dataTitle: 'Données', dataUpdated: 'Dernière mise à jour des données', sourceModified: 'Dernière modification du tableau source',
    codeTitle: 'Code source', codeTxt: 'Le code de cette application est ouvert, sur GitHub.'
  },
  en: {
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    agenda: 'Agenda', week: 'Week', menu: 'Menu', lang: 'Language', loading: 'Loading...',
    open: 'Open now', closed: 'Closed now', pause: 'Pause', lanes: 'lanes',
    setupUntil: 'This setup until', poolUntil: 'pool open until',
    opensAt: 'Next opening today at', reopensAt: 'Swimming resumes at',
    noSession: 'No more sessions today.', noToday: 'No schedule published for today.',
    startsOn: 'The first published schedule starts on',
    nextMatch: 'Next session', now: 'Now', nowLc: 'now', until: 'until',
    noMatch: 'No session matches in the published weeks.',
    pool: 'Pool', when: 'When', lenAny: '25m and 50m', len25: '25m', len50: '50m', both: 'Both',
    band: { all: 'All day', morning: 'Morning', lunch: 'Lunch 12-14h', afternoon: 'Afternoon 14-18h', evening: 'Evening 18h+' },
    bandShort: { all: 'All day', morning: 'Morning', lunch: 'Lunch', afternoon: 'Afternoon', evening: 'Evening' },
    pauseGeneric: 'Pause, pool reconfiguration',
    pauseLong: 'Lifeguards ask swimmers to leave the water during the change.',
    noneDay: 'No session for this filter on that day.', closedDay: 'Pool closed', to: 'to',
    sessionsOf: 'Sessions on',
    updated: 'Schedule updated', justNow: 'just now',
    source: 'Source', unofficial: 'unofficial',
    plan: 'Illustrative, public 25m on the right', closedAt: 'Pool closed at this time.',
    sameSetup: 'Same setup for the whole block.',
    suspect: 'Suspicious figure in the source schedule',
    legend: 'Darker = more lanes.', legClosed: 'closed', legChg: 'changeover',
    close: 'Close', prev: 'Previous week', next: 'Next week', nextOpen: 'Next openings',
    pickDay: 'Pick a day',
    notPublished: 'Next schedule not published yet',
    lastPublished: 'Last published schedule', seeLastWeek: 'See the last week',
    offline: 'Offline, data from', loadError: 'Could not load the schedule.', retry: 'Retry',
    weekShort: 'Week of',
    colon: ': ', home: 'Home', about: 'About', appName: 'Blocry Swimming Pool schedule', locale: 'en-GB',
    restToday: 'Still to come today',
    nextOpening: 'Next opening', seeInAgenda: 'See this day in Agenda',
    noNextOpening: 'No other opening in the published weeks.',
    theme: 'Theme', themeName: { auto: 'auto', light: 'light', dark: 'dark' }, themeNext: 'Tap to switch to',
    pool_: 'The pool', country: 'Belgium', phone: 'Phone', call: 'Call',
    map: 'See on the map (OpenStreetMap)', officialSite: 'Official site',
    discTitle: 'Personal project, unofficial',
    disc: 'This app is a personal hobby project. It is not affiliated with, endorsed by or run by the Centre sportif de Blocry or UCLouvain.',
    discCheck: 'For official information, closures and prices, always check the official site.',
    howTitle: 'How it works',
    how: ['Lane counts come from the spreadsheet the pool publishes, refreshed four times a day.',
      'The pool plan is illustrative.', 'Figures can change at short notice.'],
    dataTitle: 'Data', dataUpdated: 'Last data update', sourceModified: 'Source spreadsheet last modified',
    codeTitle: 'Source code', codeTxt: 'The code of this app is open, on GitHub.'
  }
};

/* constants and helpers */
const CAP = { l25: 16, l50: 8 };
const BANDS = { all: [0, 1440], morning: [0, 720], lunch: [720, 840], afternoon: [840, 1080], evening: [1080, 1440] };
const DAY0 = 420, ROWS = 30, DAYEND = DAY0 + ROWS * 30;
const SOURCE_URL = 'https://csblocry.be/piscines/';
const CODE_URL = 'https://github.com/jdelsoir/blocry-pool';
const MAP_URL = 'https://www.openstreetmap.org/search?query=Route%20de%20Blocry%202%2C%201348%20Louvain-la-Neuve';
const TABS = ['home', 'agenda', 'week', 'about'];
const THEMES = ['auto', 'light', 'dark'];
const toMin = (t) => +t.slice(0, 2) * 60 + +t.slice(3, 5);
const fmt = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
const parseD = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } }
};

/* state */
const saved = store.get('blocry-pool', {});
const S = {
  lang: saved.lang === 'fr' || saved.lang === 'en' ? saved.lang : ((navigator.language || 'fr').toLowerCase().startsWith('fr') ? 'fr' : 'en'),
  tab: 'home', /* the app always opens on Home */
  theme: readTheme(),
  len: ['any', '25', '50'].includes(saved.len) ? saved.len : 'any',
  band: Object.prototype.hasOwnProperty.call(BANDS, saved.band) ? saved.band : 'all',
  open: null, day: null, wi: 0, cell: null, scroll: {}
};
const save = () => store.set('blocry-pool', { lang: S.lang, len: S.len, band: S.band });
const T = () => I18N[S.lang];

let DATA = null, WEEKS = [], DAYS = [], DAYMAP = new Map(), OFFLINE = false, LOAD_ERROR = false;
let todayStr = '', nowMin = 0, nowDow = 0;
/* Semaine follows the current week across date changes until the user navigates weeks. */
let wiDate = '', userNavigated = false;

/* "Now" in Europe/Brussels (the pool's zone); falls back to the device clock. */
function tickNow() {
  const d = new Date();
  let date = null, min = null;
  try {
    const p = {};
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Brussels', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(d).forEach((x) => { p[x.type] = x.value; });
    date = p.year + '-' + p.month + '-' + p.day;
    min = (+p.hour % 24) * 60 + +p.minute;
  } catch (e) { /* no Intl time zones */ }
  if (!date) {
    date = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    min = d.getHours() * 60 + d.getMinutes();
  }
  todayStr = date; nowMin = min; nowDow = parseD(date).getDay();
}

const dLabel = (s) => { const d = parseD(s); return T().days[d.getDay()] + ' ' + d.getDate() + ' ' + T().months[d.getMonth()]; };
const dShort = (s) => { const d = parseD(s); return T().days[d.getDay()] + ' ' + d.getDate(); };

function relTime(iso) {
  const t = Date.parse(iso);
  if (!isFinite(t)) return '';
  // Clamp to the past: a device clock running behind must not show "in 1 hour".
  const sec = Math.min(0, Math.round((t - Date.now()) / 1000));
  const a = Math.abs(sec);
  if (a < 60) return T().justNow;
  let rtf;
  try { rtf = new Intl.RelativeTimeFormat(S.lang, { numeric: 'always' }); } catch (e) { return ''; }
  if (a < 3600) return rtf.format(Math.round(sec / 60), 'minute');
  if (a < 86400) return rtf.format(Math.round(sec / 3600), 'hour');
  return rtf.format(Math.round(sec / 86400), 'day');
}
function absTime(iso) {
  const t = new Date(iso);
  if (isNaN(t)) return '';
  const ds = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  return dLabel(ds) + ' ' + fmt(t.getHours() * 60 + t.getMinutes());
}
/* "Samedi 3 octobre 2026" for a YYYY-MM-DD string. */
function longDate(s) {
  try { return sentence(new Intl.DateTimeFormat(T().locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(parseD(s))); } catch (e) { return dLabel(s); }
}
/* Full localized date and time of an ISO instant, in the pool's zone. */
function longDT(iso) {
  const t = new Date(iso);
  if (isNaN(t)) return '';
  const o = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' };
  try { return sentence(new Intl.DateTimeFormat(T().locale, Object.assign({ timeZone: 'Europe/Brussels' }, o)).format(t)); } catch (e) { /* no tz data */ }
  try { return sentence(new Intl.DateTimeFormat(T().locale, o).format(t)); } catch (e) { return absTime(iso); }
}

/* Parse "changement de 8h40 à 9h" into "08:40-09:00". */
function changeRange(note) {
  const m = (note || '').match(/(\d{1,2})\s*[hH:]\s*(\d{2})?\D+?(\d{1,2})\s*[hH:]\s*(\d{2})?/);
  return m ? fmt(+m[1] * 60 + (+m[2] || 0)) + '-' + fmt(+m[3] * 60 + (+m[4] || 0)) : null;
}
const sentence = (s) => { s = String(s || '').trim(); return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; };
/* Day closure notes are often all caps in the source ("FERMÉ SAMEDI ET DIMANCHE"). */
const calm = (s) => { s = String(s || '').trim(); return s === s.toUpperCase() ? sentence(s.toLowerCase()) : sentence(s); };
function changeText(note) {
  if (S.lang === 'fr') return note ? T().pause + ', ' + String(note).trim().replace(/^./, (c) => c.toLowerCase()) : T().pauseGeneric;
  const r = changeRange(note);
  return T().pauseGeneric + (r ? ' ' + r : '');
}
const closedText = (note) => (S.lang === 'fr' && note ? calm(note) : T().closedDay);

/* schedule logic */
function slotKind(s) {
  if (s.closed) return 'closed';
  if (s.change) return 'change';
  if ((s.l25 || 0) > 0 || (s.l50 || 0) > 0) return 'open';
  if (s.note) return 'closed'; /* a note with no lanes at all: nothing to swim in */
  return null;
}
function sameBlock(p, kind, s, a) {
  if (!p || p.end !== a || p.kind !== kind) return false;
  if (kind === 'open') return p.l25 === (s.l25 || 0) && p.l50 === (s.l50 || 0);
  return p.text === (s.closed || s.change || s.note || null);
}
const addNote = (b, n) => { if (n && !b.notes.includes(n)) b.notes.push(n); };

/* Raw blocks of a day (unfiltered): consecutive half-hours with identical content merged. */
function sessions(day) {
  const out = [];
  if (!day || day.closed || !Array.isArray(day.slots)) return out;
  const slots = day.slots.slice().sort((x, y) => toMin(x.t) - toMin(y.t));
  for (const s of slots) {
    const kind = slotKind(s);
    if (!kind) continue;
    const a = toMin(s.t), b = a + 30, p = out[out.length - 1];
    if (sameBlock(p, kind, s, a)) {
      p.end = b; if (kind === 'open') addNote(p, s.note); p.suspect = p.suspect || !!s.suspect; continue;
    }
    const blk = { start: a, end: b, kind, l25: s.l25 || 0, l50: s.l50 || 0, text: s.closed || s.change || (kind === 'closed' ? s.note : null) || null, notes: [], suspect: !!s.suspect };
    if (kind === 'open') addNote(blk, s.note);
    out.push(blk);
  }
  return out;
}

/* Blocks as seen through the filters: hidden lengths zeroed, non-matching blocks removed,
   equal neighbours merged, pauses and closures kept only next to a visible session. */
function visible(day, len, band) {
  const out = [], b = BANDS[band || 'all'];
  for (const s of sessions(day)) {
    const inBand = s.end > b[0] && s.start < b[1];
    if (s.kind !== 'open') { if (inBand) out.push(Object.assign({}, s, { notes: s.notes.slice() })); continue; }
    const v25 = len === '50' ? 0 : s.l25, v50 = len === '25' ? 0 : s.l50;
    if (!(v25 || v50) || !inBand) continue;
    const p = out[out.length - 1];
    if (p && p.kind === 'open' && p.end === s.start && p.l25 === v25 && p.l50 === v50) {
      p.end = s.end; s.notes.forEach((n) => addNote(p, n)); p.suspect = p.suspect || s.suspect; continue;
    }
    out.push(Object.assign({}, s, { l25: v25, l50: v50, notes: s.notes.slice() }));
  }
  const touches = (o, s) => o && o.kind === 'open' && (o.end === s.start || o.start === s.end);
  return out.filter((s, i) => s.kind === 'open' || touches(out[i - 1], s) || touches(out[i + 1], s));
}
const openBlocks = (day, len, band) => visible(day, len, band).filter((s) => s.kind === 'open');

function nextOpenings(n, len, band) {
  const res = [];
  for (const day of DAYS) {
    if (day.date < todayStr) continue;
    for (const s of openBlocks(day, len, band)) {
      if (day.date === todayStr && s.end <= nowMin) continue;
      res.push(Object.assign({ date: day.date, isNow: day.date === todayStr && s.start <= nowMin }, s));
      if (res.length >= n) return res;
    }
  }
  return res;
}

function dayClosedNote(day) { return day && day.closed ? day.closed : null; }
function dayHasOpen(day) { return sessions(day).some((s) => s.kind === 'open'); }

/* render pieces */
const lanesTxt = (s) => [s.l25 ? '<span class="a">25m · ' + s.l25 + '</span>' : '', s.l50 ? '<span class="b">50m · ' + s.l50 + '</span>' : ''].filter(Boolean).join(' ');
const lanesPlain = (s) => [s.l25 ? '25m · ' + s.l25 : '', s.l50 ? '50m · ' + s.l50 : ''].filter(Boolean).join(', ');

/* Pool plan: 10 physical lanes. l50 full-length rows on top; the rest are split by the pontoon.
   25m lanes fill the right side first (where the public usually swims), then the left. */
function planHTML(l25, l50) {
  const r50 = Math.max(0, Math.min(10, l50 || 0)), split = 10 - r50;
  const n25 = Math.max(0, l25 || 0);
  const right = Math.min(n25, split), left = Math.min(Math.max(0, n25 - right), split);
  let rows = '';
  for (let r = 0; r < 10; r++) {
    if (r < r50) { rows += '<div class="row full"><i class="on50"></i></div>'; continue; }
    const k = r - r50;
    rows += '<div class="row"><i class="' + (k < left ? 'on25' : '') + '"></i><i class="pont"></i><i class="' + (k < right ? 'on25' : '') + '"></i></div>';
  }
  const cap = [r50 ? r50 + ' × 50m' : '', n25 ? n25 + ' × 25m' : ''].filter(Boolean).join(' · ');
  return '<div class="plan" aria-hidden="true">' + rows + '</div><div class="plan-cap"><span>' + T().plan + '</span><span>' + cap + '</span></div>';
}
const bigHTML = (a, b) => '<div class="big"><div class="cell c25' + (a ? '' : ' zero') + '"><div class="n">' + (a || '-') + '</div><div class="u">' + T().lanes + ' · 25m</div></div>' +
  '<div class="cell c50' + (b ? '' : ' zero') + '"><div class="n">' + (b || '-') + '</div><div class="u">' + T().lanes + ' · 50m</div></div></div>';
const lenLabel = (v) => (v === '25' ? T().len25 : v === '50' ? T().len50 : T().lenAny);
const notesHTML = (blk) => blk.notes.map((n) => '<div class="note">' + esc(n) + '</div>').join('') + (blk.suspect ? '<div class="suspect">' + T().suspect + '</div>' : '');

function footHTML() {
  const t = T();
  const rel = DATA && DATA.generatedAt ? relTime(DATA.generatedAt) : '';
  return '<div class="foot">' + (rel ? '<span>' + t.updated + ' ' + esc(rel) + '</span>' : '') +
    '<span>' + t.source + ': <a href="' + SOURCE_URL + '" target="_blank" rel="noopener">csblocry.be</a> (' + t.unofficial + ')</span></div>';
}
function offlineHTML() {
  if (!OFFLINE || !DATA) return '';
  return '<div class="banner" role="status">' + T().offline + ' ' + esc(absTime(DATA.generatedAt)) + '</div>';
}

/* Session list shared by Home and Agenda: merged blocks, pauses, closures, notes, suspect flags. */
const barHTML = (cls, label, n, cap) => '<div class="bar ' + cls + '"><span>' + label + '</span><div class="track"><div class="fill" data-w="' + Math.min(100, (n / cap) * 100).toFixed(1) + '"></div></div><span class="v">' + n + '</span></div>';
function sessListHTML(vs, date) {
  const t = T();
  return '<ol class="list">' + vs.map((s) => {
    if (s.kind === 'change') return '<li class="change">' + esc(changeText(s.text)) + '</li>';
    if (s.kind === 'closed') return '<li class="closure">' + fmt(s.start) + ' · ' + esc(closedText(s.text)) + '</li>';
    const live = date === todayStr && s.start <= nowMin && s.end > nowMin;
    return '<li class="sess' + (live ? ' live' : '') + '"' + (live ? ' aria-current="time"' : '') + '><div><div class="t1">' + fmt(s.start) + '</div><div class="t2">' + t.to + ' ' + fmt(s.end) + '</div></div>' +
      '<div class="bars">' + (s.l25 ? barHTML('b25', '25m', s.l25, CAP.l25) : '') + (s.l50 ? barHTML('b50', '50m', s.l50, CAP.l50) : '') + '</div>' + notesHTML(s) + '</li>';
  }).join('') + '</ol>';
}

/* Now card (Home) */
function nowCardHTML() {
  const t = T();
  const first = DAYS[0].date;
  const tday = DAYMAP.get(todayStr), ts = sessions(tday);
  const cur = ts.find((s) => s.start <= nowMin && s.end > nowMin);
  const time = '<span class="now-time">' + t.days[nowDow] + ' ' + fmt(nowMin) + '</span>';
  let pill, body = '', foot;
  if (cur && cur.kind === 'open') {
    /* Follow back-to-back blocks; a changeover only counts when swimming resumes right after it. */
    let until = cur.end, reach = cur.end;
    for (const s of ts) {
      if (s.start !== reach) continue;
      if (s.kind === 'closed') break;
      reach = s.end;
      if (s.kind === 'open') until = reach;
    }
    pill = '<span class="pill open"><span class="dot"></span>' + t.open + '</span>';
    body = bigHTML(cur.l25, cur.l50) + planHTML(cur.l25, cur.l50) + notesHTML(cur);
    foot = t.setupUntil + ' <b>' + fmt(cur.end) + '</b>' + (until > cur.end ? ', ' + t.poolUntil + ' <b>' + fmt(until) + '</b>' : '');
  } else {
    const later = ts.find((s) => s.kind === 'open' && s.start >= nowMin);
    if (cur && cur.kind === 'change') {
      pill = '<span class="pill pause"><span class="dot"></span>' + t.pause + '</span>';
      foot = esc(changeText(cur.text)) + (later ? '. ' + t.reopensAt + ' <b>' + fmt(later.start) + '</b>' : '');
    } else {
      pill = '<span class="pill closed"><span class="dot"></span>' + t.closed + '</span>';
      if (todayStr < first) foot = t.startsOn + ' <b>' + dLabel(first) + '</b>.';
      else if (!tday) foot = t.noToday;
      else if (dayClosedNote(tday)) foot = esc(closedText(dayClosedNote(tday)));
      else if (cur && cur.kind === 'closed') foot = esc(closedText(cur.text)) + (later ? '. ' + t.opensAt + ' <b>' + fmt(later.start) + '</b>' : '');
      else if (later) foot = t.opensAt + ' <b>' + fmt(later.start) + '</b>.';
      else foot = dayHasOpen(tday) ? t.noSession : t.closedDay;
    }
    body = bigHTML(0, 0);
  }
  return '<section class="now-card" aria-label="' + t.now + '"><div class="now-top">' + pill + time + '</div>' + body + '<div class="now-foot">' + foot + '</div></section>';
}

function notPublishedHTML() {
  const t = T(), lw = WEEKS[WEEKS.length - 1], last = DAYS[DAYS.length - 1].date;
  return '<section class="state-card" role="status"><h2>' + t.notPublished + '</h2>' +
    '<p>' + t.lastPublished + ': ' + dLabel(lw.start) + ' - ' + dLabel(last) + '.</p>' +
    '<button type="button" class="btn" data-tab="week" data-wjump="last">' + t.seeLastWeek + '</button></section>';
}

/* Home: today at a glance */
function heroHTML() {
  const t = T();
  return '<header class="hero"><h2 class="hero-t">' + t.appName + '</h2><p class="hero-d">' + esc(longDate(todayStr)) + '</p></header>';
}

/* Today's blocks from now on: the one in progress counts; pauses and closures only next to a session. */
function remainingToday(day) {
  const vs = visible(day, 'any', 'all').filter((s) => s.end > nowMin);
  const touches = (o, s) => o && o.kind === 'open' && (o.end === s.start || o.start === s.end);
  return vs.filter((s, i) => s.kind === 'open' || touches(vs[i - 1], s) || touches(vs[i + 1], s));
}

function nextOpeningHTML() {
  const t = T(), nx = nextOpenings(1, 'any', 'all')[0];
  if (!nx) return '<section class="state-card next-card"><h2>' + t.nextOpening + '</h2><p>' + t.noNextOpening + '</p></section>';
  return '<section class="state-card next-card"><h2>' + t.nextOpening + '</h2>' +
    '<p class="nx-when"><b>' + esc(longDate(nx.date)) + '</b><span class="nx-h">' + fmt(nx.start) + '-' + fmt(nx.end) + '</span></p>' +
    '<p class="nx-l">' + lanesTxt(nx) + '</p>' +
    '<button type="button" class="btn" data-tab="agenda" data-dayjump="' + nx.date + '">' + t.seeInAgenda + '</button></section>';
}

function homeHTML() {
  const t = T();
  const first = DAYS[0].date, last = DAYS[DAYS.length - 1].date;
  if (todayStr > last) return offlineHTML() + heroHTML() + notPublishedHTML() + footHTML();
  const tday = DAYMAP.get(todayStr);
  let rest = '';
  if (tday && todayStr >= first) {
    const vs = remainingToday(tday);
    if (vs.some((s) => s.kind === 'open')) rest = '<h2 class="h2">' + t.restToday + '</h2>' + sessListHTML(vs, todayStr);
    else rest = nextOpeningHTML(); /* the now card above already says the day is over or closed */
  } else rest = nextOpeningHTML();
  return offlineHTML() + heroHTML() + nowCardHTML() + rest + footHTML();
}

/* About */
function aboutHTML() {
  const t = T();
  const row = (k, v) => '<div class="kv"><dt>' + k + '</dt><dd>' + v + '</dd></div>';
  const ext = (href, txt) => '<a href="' + href + '" target="_blank" rel="noopener">' + txt + '</a>';
  let data = '';
  if (DATA) {
    data = '<h2 class="h2">' + t.dataTitle + '</h2><dl class="about-card kvs">' +
      (DATA.generatedAt ? row(t.dataUpdated, esc(longDT(DATA.generatedAt)) + (relTime(DATA.generatedAt) ? ' <span class="muted-i">(' + esc(relTime(DATA.generatedAt)) + ')</span>' : '')) : '') +
      (DATA.source && DATA.source.lastModified ? row(t.sourceModified, esc(longDT(DATA.source.lastModified))) : '') +
      '</dl>';
  }
  return offlineHTML() + heroHTML() +
    '<section class="state-card disc"><h2>' + t.discTitle + '</h2><p>' + t.disc + '</p><p><b>' + t.discCheck + '</b></p>' +
    '<p>' + ext(SOURCE_URL, t.officialSite + ': csblocry.be') + '</p></section>' +
    '<h2 class="h2">' + t.pool_ + '</h2>' +
    '<section class="about-card"><address class="addr">Piscine de Blocry<br>Route de Blocry 2<br>1348 Louvain-la-Neuve<br>' + t.country + '</address>' +
    '<p class="phone"><span class="k">' + t.phone + '</span> <span class="num">010 48 38 58</span>' +
    '<a class="btn btn-sm" href="tel:+3210483858">' + t.call + '</a></p>' +
    '<ul class="links"><li>' + ext(MAP_URL, t.map) + '</li><li>' + ext(SOURCE_URL, t.officialSite + ' (csblocry.be)') + '</li></ul></section>' +
    '<h2 class="h2">' + t.howTitle + '</h2><ul class="about-card how">' + t.how.map((x) => '<li>' + x + '</li>').join('') + '</ul>' +
    data +
    '<h2 class="h2">' + t.codeTitle + '</h2><section class="about-card"><p>' + t.codeTxt + '</p><p>' + ext(CODE_URL, 'github.com/jdelsoir/blocry-pool') + '</p></section>';
}

/* Agenda */
function agendaHTML() {
  const t = T();
  const stripDays = DAYS.filter((d) => d.date >= todayStr);
  if (!stripDays.length) return offlineHTML() + notPublishedHTML() + footHTML();
  if (!S.day || !stripDays.some((d) => d.date === S.day)) S.day = stripDays[0].date;

  const nx = nextOpenings(1, S.len, S.band)[0];
  const day = DAYMAP.get(S.day), cn = dayClosedNote(day), vs = visible(day, S.len, S.band);
  const opt = (k, v, l) => '<button type="button" class="chip" data-set="' + k + '" data-val="' + v + '" aria-pressed="' + (S[k] === v) + '">' + l + '</button>';
  let panel = '';
  if (S.open === 'len') panel = '<div class="fpanel" id="fp-len">' + opt('len', 'any', t.lenAny) + opt('len', '25', t.len25) + opt('len', '50', t.len50) + '</div>';
  if (S.open === 'band') panel = '<div class="fpanel" id="fp-band">' + Object.keys(BANDS).map((k) => opt('band', k, t.band[k])).join('') + '</div>';
  let list;
  if (cn) list = '<div class="closed-day">' + esc(closedText(cn)) + '</div>';
  else if (!dayHasOpen(day)) list = '<div class="closed-day">' + t.closedDay + '</div>';
  else if (!vs.some((s) => s.kind === 'open')) list = '<div class="empty-day">' + t.noneDay + '</div>';
  else list = sessListHTML(vs, S.day);

  const nextTxt = nx
    ? t.nextMatch + ': <b>' + (nx.isNow ? t.nowLc : dLabel(nx.date) + ' ' + fmt(nx.start)) + '</b> ' + t.until + ' ' + fmt(nx.end) + ' · ' + lanesPlain(nx)
    : t.noMatch;

  return offlineHTML() +
    '<div class="filters"><div class="fbar">' +
    '<button type="button" class="fsum" data-open="len" aria-expanded="' + (S.open === 'len') + '" aria-controls="fp-len"><span class="k">' + t.pool + '</span><span class="v">' + lenLabel(S.len) + '</span><span class="car" aria-hidden="true">▾</span></button>' +
    '<button type="button" class="fsum" data-open="band" aria-expanded="' + (S.open === 'band') + '" aria-controls="fp-band"><span class="k">' + t.when + '</span><span class="v">' + t.bandShort[S.band] + '</span><span class="car" aria-hidden="true">▾</span></button>' +
    '</div>' + panel + '</div>' +
    '<div class="next-line">' + nextTxt + '</div>' +
    '<div class="days" role="group" aria-label="' + t.pickDay + '">' + stripDays.map((d) => {
      const dd = parseD(d.date), ob = openBlocks(d, S.len, S.band);
      const ticks = Array.from({ length: ROWS }, (_, i) => { const m = DAY0 + i * 30; return '<i' + (ob.some((x) => x.start <= m && x.end > m) ? ' class="on"' : '') + '></i>'; }).join('');
      return '<button type="button" class="day' + (d.date === todayStr ? ' today' : '') + '" data-day="' + d.date + '" aria-pressed="' + (d.date === S.day) + '" aria-label="' + dLabel(d.date) + '"><span class="dw" aria-hidden="true">' + t.days[dd.getDay()] + '</span><span class="dn" aria-hidden="true">' + dd.getDate() + '</span><span class="spark" aria-hidden="true">' + ticks + '</span></button>';
    }).join('') + '</div>' +
    '<h2 class="h2">' + t.sessionsOf + ' ' + dLabel(S.day) + '</h2>' + list + footHTML();
}

/* Semaine */
const lvl = (n, cap) => (n <= 0 ? 0 : Math.max(18, Math.round(Math.min(1, n / cap) * 100)));
const fillFor = (key, n) => (n <= 0 ? 'transparent' : 'color-mix(in oklab, var(--' + (key === 'l25' ? 'c25' : 'c50') + ') ' + lvl(n, CAP[key]) + '%, var(--empty))');

function defaultWeek() {
  const i = WEEKS.findIndex((w) => w.days.some((d) => d.date === todayStr));
  if (i >= 0) return i;
  if (todayStr < WEEKS[0].start) return 0;
  const j = WEEKS.findIndex((w) => w.start > todayStr);
  return j >= 0 ? j : WEEKS.length - 1;
}

function cellInfo(day, m) {
  if (!day || day.closed) return { kind: 'closed' };
  const s = (day.slots || []).find((x) => toMin(x.t) === m);
  if (!s) return { kind: 'closed' };
  const k = slotKind(s);
  return { kind: k || 'closed', s };
}

function weekHTML() {
  const t = T(), w = WEEKS[S.wi];
  const nx = nextOpenings(5, S.len, 'all');
  const pastEnd = todayStr > DAYS[DAYS.length - 1].date;
  let cells = '';
  for (let r = 0; r < ROWS; r++) {
    const m = DAY0 + r * 30;
    cells += '<div class="hr" aria-hidden="true">' + (r % 2 === 0 ? String(m / 60) : '') + '</div>';
    w.days.forEach((d) => {
      const ci = cellInfo(d, m), id = d.date + '|' + m, sc = S.cell === id ? ' sel' : '', lab = dLabel(d.date) + ' ' + fmt(m);
      if (ci.kind === 'closed') { cells += '<button type="button" class="c closed' + sc + '" data-cell="' + id + '" aria-label="' + lab + ', ' + t.legClosed + '"></button>'; return; }
      if (ci.kind === 'change') { cells += '<button type="button" class="c chg' + sc + '" data-cell="' + id + '" aria-label="' + lab + ', ' + t.legChg + '"></button>'; return; }
      const s = ci.s, parts = [];
      if (S.len !== '50') parts.push('<i data-bg="' + fillFor('l25', s.l25 || 0) + '"></i>');
      if (S.len !== '25') parts.push('<i data-bg="' + fillFor('l50', s.l50 || 0) + '"></i>');
      cells += '<button type="button" class="c' + sc + '" data-cell="' + id + '" aria-label="' + lab + ': 25m ' + (s.l25 || 0) + ', 50m ' + (s.l50 || 0) + '">' + parts.join('') + '</button>';
    });
  }
  const d0 = parseD(w.days[0].date), d6 = parseD(w.days[6].date);
  const seg = (v, l) => '<button type="button" data-set="len" data-val="' + v + '" aria-pressed="' + (S.len === v) + '">' + l + '</button>';
  const ramp = (k) => '<span class="ramp">' + [2, 5, 9, 14].map((n) => {
    const v = k === 'c25' ? n : Math.ceil(n / 2);
    return '<i data-bg="color-mix(in oklab, var(--' + k + ') ' + lvl(v, k === 'c25' ? CAP.l25 : CAP.l50) + '%, var(--empty))"></i>';
  }).join('') + '</span>';
  const label = d0.getDate() + ' ' + t.months[d0.getMonth()] + ' - ' + d6.getDate() + ' ' + t.months[d6.getMonth()];
  return offlineHTML() + (pastEnd ? '<div class="banner" role="status">' + t.notPublished + '</div>' : '') +
    '<div class="filters"><div class="subrow">' +
    '<div class="seg" role="group" aria-label="' + t.pool + '">' + seg('any', t.both) + seg('25', '25m') + seg('50', '50m') + '</div>' +
    '<div class="weeknav"><button type="button" class="icon-btn" data-wk="-1" ' + (S.wi === 0 ? 'disabled' : '') + ' aria-label="' + t.prev + '">‹</button>' +
    '<span class="wk" aria-live="polite">' + label + '</span>' +
    '<button type="button" class="icon-btn" data-wk="1" ' + (S.wi === WEEKS.length - 1 ? 'disabled' : '') + ' aria-label="' + t.next + '">›</button></div>' +
    '</div></div>' +
    '<h2 class="h2 h2-gap">' + t.nextOpen + '</h2>' +
    '<div class="nexts" role="group" aria-label="' + t.nextOpen + '">' +
    (nx.map((o) => {
      const m = o.isNow ? Math.max(o.start, Math.floor(nowMin / 30) * 30) : o.start;
      return '<button type="button" class="nx' + (o.isNow ? ' live' : '') + '" data-jump="' + o.date + '|' + m + '"><span class="d">' + (o.isNow ? t.now : dShort(o.date)) + '</span><span class="h">' + fmt(o.start) + '-' + fmt(o.end) + '</span><span class="l">' + lanesTxt(o) + '</span></button>';
    }).join('') || '<span class="muted">' + (pastEnd ? t.notPublished : t.noMatch) + '</span>') + '</div>' +
    '<div class="grid-wrap">' +
    '<div class="ghead" aria-hidden="true"><div></div>' + w.days.map((d) => { const dd = parseD(d.date); return '<div class="' + (d.date === todayStr ? 'today' : '') + '">' + t.days[dd.getDay()].slice(0, 2) + '<b>' + dd.getDate() + '</b></div>'; }).join('') + '</div>' +
    '<div class="grid" id="bgrid">' + cells + '</div></div>' +
    '<div class="legend">' +
    (S.len !== '50' ? '<span><span class="k25"></span>25m ' + ramp('c25') + '</span>' : '') +
    (S.len !== '25' ? '<span><span class="k50"></span>50m ' + ramp('c50') + '</span>' : '') +
    '<span>' + t.legend + '</span><span><span class="lg-closed"></span>' + t.legClosed + '</span><span><span class="lg-chg"></span>' + t.legChg + '</span>' +
    '</div>' + footHTML();
}

function sheetHTML(id) {
  const t = T(), date = id.split('|')[0], m = +id.split('|')[1];
  const day = DAYMAP.get(date), blocks = sessions(day), s = blocks.find((x) => x.start <= m && x.end > m);
  let body;
  const title = (txt) => '<h2 id="sheet-title">' + txt + '</h2>';
  if (!s) body = title(dLabel(date) + ' · ' + fmt(m)) + '<div class="sub">' + (dayClosedNote(day) ? esc(closedText(dayClosedNote(day))) : t.closedAt) + '</div>';
  else if (s.kind === 'closed') body = title(dLabel(date) + ' · ' + fmt(s.start) + '-' + fmt(s.end)) + '<div class="sub">' + esc(closedText(s.text)) + '</div>';
  else if (s.kind === 'change') {
    const r = changeRange(s.text);
    body = title(dLabel(date) + ' · ' + t.pause + ' ' + (r || fmt(s.start) + '-' + fmt(s.end))) + '<div class="sub">' + esc(changeText(s.text)) + '. ' + t.pauseLong + '</div>';
  } else {
    body = title(dLabel(date) + ' · ' + fmt(s.start) + '-' + fmt(s.end)) + bigHTML(s.l25, s.l50) + planHTML(s.l25, s.l50) + notesHTML(s) + '<div class="sub">' + t.sameSetup + '</div>';
  }
  return '<div class="grab" aria-hidden="true"></div>' + body + '<button type="button" class="close" data-close="1">' + t.close + '</button>';
}

/* shell */
const $ = (id) => document.getElementById(id);
const main = $('main'), sheet = $('bsheet'), scrim = $('scrim');
let lastFocus = null;

function applyStyles(rootEl) {
  rootEl.querySelectorAll('[data-w]').forEach((e) => { e.style.width = e.dataset.w + '%'; });
  rootEl.querySelectorAll('[data-bg]').forEach((e) => { e.style.background = e.dataset.bg; });
}

function renderChrome() {
  const t = T();
  document.documentElement.lang = S.lang;
  $('title').textContent = t[S.tab];
  document.title = t.appName;
  $('langs').setAttribute('aria-label', t.lang);
  const tb = $('themebtn');
  if (tb) {
    const next = THEMES[(THEMES.indexOf(S.theme) + 1) % THEMES.length];
    tb.dataset.mode = S.theme;
    tb.setAttribute('aria-label', t.theme + t.colon + t.themeName[S.theme] + '. ' + t.themeNext + ' ' + t.themeName[next] + '.');
    tb.title = t.theme + t.colon + t.themeName[S.theme];
  }
  $('langs').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === S.lang)));
  $('tabs').setAttribute('aria-label', t.menu);
  $('tabs').querySelectorAll('.tab').forEach((b) => {
    const on = b.dataset.tab === S.tab;
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    b.querySelector('span').textContent = t[b.dataset.tab];
  });
}

function render(opts) {
  opts = opts || {};
  tickNow();
  renderChrome();
  if (!DATA && S.tab !== 'about') {
    main.innerHTML = '<div class="inner">' + (LOAD_ERROR
      ? '<section class="state-card" role="alert"><h2>' + T().loadError + '</h2><button type="button" class="btn" data-retry="1">' + T().retry + '</button></section>' + footHTML()
      : '<div class="loading">' + T().loading + '</div>') + '</div>';
    return;
  }
  if (DATA && todayStr !== wiDate) { wiDate = todayStr; if (!userNavigated) S.wi = defaultWeek(); }
  if (!opts.resetScroll && main.dataset.tab) S.scroll[main.dataset.tab] = main.scrollTop;
  main.dataset.tab = S.tab;
  const html = { home: homeHTML, agenda: agendaHTML, week: weekHTML, about: aboutHTML }[S.tab];
  main.innerHTML = '<div class="inner">' + html() + '</div>';
  applyStyles(main);
  main.scrollTop = opts.resetScroll ? 0 : (S.scroll[S.tab] || 0);
  if (S.tab === 'agenda') {
    const b = main.querySelector('.day[aria-pressed="true"]');
    if (b) {
      const c = b.parentElement, cr = c.getBoundingClientRect(), br = b.getBoundingClientRect();
      c.scrollLeft = Math.max(0, c.scrollLeft + (br.left - cr.left) - (c.clientWidth - br.width) / 2);
    }
  } else if (S.tab === 'week') placeNow();
  renderSheet();
}

function placeNow() {
  main.querySelectorAll('.nowline').forEach((n) => n.remove());
  if (S.tab !== 'week' || !WEEKS[S.wi]) return;
  const di = WEEKS[S.wi].days.findIndex((d) => d.date === todayStr);
  if (di < 0 || nowMin < DAY0 || nowMin >= DAYEND) return;
  const grid = $('bgrid'), cell = grid && grid.querySelector('[data-cell="' + todayStr + '|' + Math.floor(nowMin / 30) * 30 + '"]');
  if (!cell) return;
  const ln = document.createElement('div');
  ln.className = 'nowline';
  ln.style.left = cell.offsetLeft + 'px';
  ln.style.width = cell.offsetWidth + 'px';
  ln.style.top = (cell.offsetTop + cell.offsetHeight * ((nowMin % 30) / 30) - 1) + 'px';
  grid.appendChild(ln);
}

function renderSheet() {
  const show = S.tab === 'week' && !!S.cell && !!DATA;
  if (show) { sheet.innerHTML = sheetHTML(S.cell); applyStyles(sheet); }
  sheet.hidden = !show;
  scrim.hidden = !show;
  /* aria-modal dialog: keep keyboard and screen reader focus inside the sheet. */
  for (const el of [main, $('tabs'), document.querySelector('.appbar')]) {
    if (!el) continue;
    el.inert = show;
    if (show) el.setAttribute('aria-hidden', 'true'); else el.removeAttribute('aria-hidden');
  }
}
function openSheet(id, btn) {
  lastFocus = btn || document.activeElement;
  S.cell = id;
  main.querySelectorAll('.c.sel').forEach((c) => c.classList.remove('sel'));
  const c = main.querySelector('[data-cell="' + id + '"]');
  if (c) c.classList.add('sel');
  renderSheet();
  const close = sheet.querySelector('.close');
  if (close) close.focus({ preventScroll: true });
}
function closeSheet() {
  S.cell = null;
  main.querySelectorAll('.c.sel').forEach((c) => c.classList.remove('sel'));
  renderSheet();
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  lastFocus = null;
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (e.target === scrim) { closeSheet(); return; }
  if (!b) return;
  const d = b.dataset;
  let resetScroll = false, focusSel = null;
  if (d.retry) { load(); return; }
  if (d.close) { closeSheet(); return; }
  if (d.cell) { openSheet(d.cell, b); return; }
  if (d.cycleTheme) {
    S.theme = THEMES[(THEMES.indexOf(S.theme) + 1) % THEMES.length];
    try { if (S.theme === 'auto') localStorage.removeItem(THEME_KEY); else localStorage.setItem(THEME_KEY, S.theme); } catch (err) { /* storage blocked */ }
    applyTheme(S.theme);
    renderChrome();
    return;
  }
  if (d.tab) {
    if (!TABS.includes(d.tab)) return;
    if (S.tab !== d.tab) { S.scroll[S.tab] = main.scrollTop; }
    S.tab = d.tab; S.open = null; S.cell = null;
    if (d.wjump === 'last') { S.wi = WEEKS.length - 1; userNavigated = true; resetScroll = true; }
    if (d.dayjump) { S.day = d.dayjump; resetScroll = true; }
    /* A button inside main is redrawn away: keep keyboard focus in the content. */
    if (main.contains(b)) focusSel = '#main';
  } else if (d.lang) { S.lang = d.lang; focusSel = '[data-lang="' + d.lang + '"]'; }
  else if (d.open) { S.open = S.open === d.open ? null : d.open; focusSel = '[data-open="' + d.open + '"]'; }
  else if (d.set) {
    S[d.set] = d.val;
    const wasOpen = S.open; S.open = null;
    focusSel = wasOpen ? '[data-open="' + wasOpen + '"]' : '[data-set="' + d.set + '"][data-val="' + d.val + '"]';
  }
  else if (d.day) { S.day = d.day; focusSel = '[data-day="' + d.day + '"]'; }
  else if (d.wk) { S.wi = Math.min(WEEKS.length - 1, Math.max(0, S.wi + +d.wk)); userNavigated = true; S.cell = null; focusSel = '[data-wk="' + d.wk + '"]'; }
  else if (d.jump) {
    const [dt, m] = d.jump.split('|');
    const wi = WEEKS.findIndex((w) => w.days.some((x) => x.date === dt));
    if (wi >= 0 && wi !== S.wi) { S.wi = wi; userNavigated = true; }
    save(); render();
    const c = main.querySelector('[data-cell="' + dt + '|' + m + '"]');
    if (c) c.scrollIntoView({ block: 'center' });
    openSheet(dt + '|' + m, c);
    return;
  } else return;
  save();
  render({ resetScroll });
  if (focusSel) {
    const f = document.querySelector(focusSel);
    if (f && !f.disabled) f.focus({ preventScroll: true });
  }
});
document.addEventListener('keydown', (e) => {
  if (!S.cell) return;
  if (e.key === 'Escape') { closeSheet(); return; }
  if (e.key === 'Tab') {
    /* Fallback trap for browsers without inert support. */
    const f = Array.from(sheet.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')).filter((x) => !x.disabled);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (!sheet.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

/* Selector that finds the focused control again after main is redrawn (every control carries data-*). */
function focusSelector(el) {
  if (!el || !main.contains(el) || el === main) return null;
  const d = el.dataset || {};
  if (d.set) return '[data-set="' + d.set + '"][data-val="' + d.val + '"]';
  for (const k of ['open', 'day', 'wk', 'cell', 'jump', 'wjump', 'dayjump', 'retry']) if (d[k]) return '[data-' + k + '="' + d[k] + '"]';
  return null;
}
/* Redraw for a new "now", keeping focus where it was. Skipped while the sheet or a filter panel is open. */
function refresh() {
  if (!DATA || S.cell || S.open) return false;
  const had = main.contains(document.activeElement), sel = focusSelector(document.activeElement);
  render();
  if (had) {
    const f = (sel && main.querySelector(sel)) || main;
    if (!f.disabled) f.focus({ preventScroll: true });
  }
  return true;
}
const nowKey = () => todayStr + '|' + Math.floor(nowMin / 30);

/* Keep "now" fresh: move the now-line every minute, full redraw on each half-hour or date change. */
let lastKey = '';
setInterval(() => {
  if (!DATA) return;
  tickNow();
  const key = nowKey();
  if (key !== lastKey && refresh()) lastKey = nowKey();
  else placeNow();
}, 60000);
window.addEventListener('resize', placeNow);
document.addEventListener('visibilitychange', () => { if (!document.hidden && refresh()) lastKey = nowKey(); });

/* data */
function indexData(data) {
  const weeks = (data && Array.isArray(data.weeks) ? data.weeks : [])
    .filter((w) => w && typeof w.start === 'string' && Array.isArray(w.days) && w.days.length)
    .sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
  if (!weeks.length) throw new Error('no weeks');
  WEEKS = weeks;
  DAYS = [];
  DAYMAP = new Map();
  for (const w of weeks) for (const d of w.days) { if (d && d.date && !DAYMAP.has(d.date)) { DAYS.push(d); DAYMAP.set(d.date, d); } }
  DAYS.sort((a, b) => (a.date < b.date ? -1 : 1));
  DATA = data;
}

async function load() {
  LOAD_ERROR = false;
  let data = null, offline = false;
  try {
    const res = await fetch('data/schedule.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    offline = res.headers.get('X-Blocry-Offline') === '1';
    data = await res.json();
  } catch (e) {
    try {
      if ('caches' in window) {
        const r = await caches.match('data/schedule.json', { ignoreSearch: true });
        if (r) { data = await r.json(); offline = true; }
      }
    } catch (e2) { /* no cache */ }
  }
  try {
    if (!data) throw new Error('no data');
    indexData(data);
    OFFLINE = offline || (navigator.onLine === false);
    tickNow();
    S.wi = defaultWeek(); wiDate = todayStr; userNavigated = false;
    lastKey = nowKey();
  } catch (e) {
    DATA = null; LOAD_ERROR = true;
  }
  render({ resetScroll: true });
}

window.addEventListener('online', () => { if (OFFLINE) load(); });

/* service worker */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(() => { /* SW optional */ });
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      /* A new deploy took over: reload once so the page matches the new assets (not on first install). */
      if (hadController && !refreshing && !S.cell) { refreshing = true; location.reload(); }
    });
  });
}

render();
load();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
