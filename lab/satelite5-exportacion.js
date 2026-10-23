/* FOUR SEASONS PÁDEL · LAB Satélite 5
 * Aún NO enlazado a index.html. Helpers aislados para pruebas.
 * Regla: satélites disponibles 1–5; en el JPG omitir únicamente los sin jugadores.
 * Conserva la visualización normal de tarjetas vacías.
 */
function fsSatTieneJugadores(s) {
  return (s?.partidos || []).some(p =>
    String(p?.parejaA || "").trim() !== "" ||
    String(p?.parejaB || "").trim() !== ""
  );
}
function fsSatsParaJpg(satelites) {
  return (Array.isArray(satelites) ? satelites : []).filter(fsSatTieneJugadores);
}
function fsFiltrarClonSatsJpg(exportSource, satelites) {
  const visibles = new Set(fsSatsParaJpg(satelites).map(s => String(s.satelite)));
  exportSource.querySelectorAll("[data-sat-card]").forEach(card => {
    if (!visibles.has(String(card.getAttribute("data-sat-card")))) card.remove();
  });
}
// Para JPG sin resultados: const sats = fsSatsParaJpg(data.satelites);
// Para JPG con resultados: llamar a fsFiltrarClonSatsJpg(exportSource,
// data.satelites) DESPUÉS de copiar el estado de los controles al clon.
// No alterar renderSatelites: las pistas vacías siguen viéndose en la web.
// Pendiente: integrar en index de rama y verificar en navegador.
// Pendiente: validar backend RPC/Apps Script acepta AI:AK y EXTRA_5.
