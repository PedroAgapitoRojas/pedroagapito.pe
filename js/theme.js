/* =========================================================
   GLOBAL THEME MANAGER — V2 Final RC
   Default: green. Persisted per browser.
========================================================= */
(() => {
  const KEY='pa-theme'; const LEGACY_KEY='theme';
  const THEMES=Object.freeze(['green','purple','light']); const DEFAULT_THEME='green';
  const getStoredTheme=()=>{try{const v=localStorage.getItem(KEY)||localStorage.getItem(LEGACY_KEY);return THEMES.includes(v)?v:DEFAULT_THEME}catch(_){return DEFAULT_THEME}};
  const apply=(theme,persist=true)=>{const selected=THEMES.includes(theme)?theme:DEFAULT_THEME;document.documentElement.dataset.theme=selected;document.body?.setAttribute('data-theme',selected);if(persist){try{localStorage.setItem(KEY,selected);localStorage.setItem(LEGACY_KEY,selected)}catch(_){}}document.querySelectorAll('[data-theme-choice]').forEach(b=>{const active=b.dataset.themeChoice===selected;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});window.dispatchEvent(new CustomEvent('pa:themechange',{detail:selected}));return selected};
  const init=()=>{apply(getStoredTheme(),false);document.querySelectorAll('[data-theme-choice]').forEach(b=>b.addEventListener('click',()=>apply(b.dataset.themeChoice)))};
  window.PATheme=Object.freeze({key:KEY,themes:THEMES,defaultTheme:DEFAULT_THEME,get:getStoredTheme,set:apply});
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
