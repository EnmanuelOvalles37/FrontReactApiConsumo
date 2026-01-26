// src/permissions/permRouteMap.ts
export const PERM_TO_ROUTE: Record<string, string> = {
  panel_ver: "/dashboard",
  clientes_ver: "/clientes",

  // Consumos
  registro_ver: "/consumos/registrar",
  reversar_consumo: "/consumos/reversar",
  reporte_consumos_reversados: "/consumos/reversos",
  reporte_consumos_por_proveedor: "/consumos/por-proveedor",
  reporte_mi_consumo: "/consumos/mi",

  // CxC
  cuentas_por_cobrar: "/cxc/pendientes",
  registrar_cobro: "/cxc/registrar-cobro",
  reporte_cuentas_por_cobrar: "/cxc/reportes",
  reporte_antiguedad_cxc: "/cxc/aging",

  // CxP
  cuentas_por_pagar: "/cxp/pendientes",
  aplicar_pago: "/cxp/aplicar-pago",
  reporte_antiguedad_cxp: "/cxp/aging",

  // Reportes
  reportes_generales: "/reportes/general",
  reporte_consumos: "/reportes/consumos",
  reporte_corte: "/reportes/corte",

  // Proveedores & Usuarios
  proveedores_usuarios: "/proveedores/usuarios",

  // Seguridad (admin)
  admin_usuarios: "/seguridad/usuarios",
  admin_roles: "/seguridad/roles",
  crear_usuario_admin: "/seguridad/usuarios-roles", // o a crear usuario
};
