export const PREFS_KEY = "ingri:prefs";

/** Inline script for <head>: applies saved appearance prefs before first paint (no flash). */
export const PREFS_BOOT_SCRIPT = `(function(){try{var p=JSON.parse(localStorage.getItem("${PREFS_KEY}")||"{}");var r=document.documentElement;r.dataset.accent=p.accent||"ink";r.dataset.font=p.fontSize||"normal";r.dataset.motion=p.reducedMotion?"reduce":"full";r.dataset.sidebar=localStorage.getItem("ingri:sidebar")==="collapsed"?"collapsed":"expanded";}catch(e){}})();`;
