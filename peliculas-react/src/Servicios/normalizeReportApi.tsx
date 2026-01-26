/* eslint-disable @typescript-eslint/no-explicit-any */
export function normalizeReportApi(data: any) {
return {
cuentasPorCobrar: data.cuentasPorCobrar?.map((c: any) => ({
empresaId: c.empresaId,
empresaNombre: c.empresaNombre,
totalConsumos: c.totalConsumos ?? 0,
montoTotal: c.montoTotal ?? 0,
ultimoConsumo: c.ultimoConsumo,
diasTranscurridos: c.diasTranscurridos ?? 0,
})) ?? [],
resumen: data.resumen ?? {},
periodo: data.periodo ?? {},
};
}