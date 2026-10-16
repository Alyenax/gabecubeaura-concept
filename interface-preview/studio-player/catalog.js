/* Same-origin public demo fixtures. No API or installed game discovery. */
window.CINEMA_CATALOG=parent.GCAStudioDemo.catalog(Number(new URLSearchParams(location.search).get('game'))||undefined);
