/*
  import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import DashboardLayout from "../Layouts/DashboardLayout";

// páginas
import Dashboard from "../Componentes/Dashboard/Dashboard";
import DashboardCajero from "../Componentes/Dashboard/DashboardCajero";
import DashboardBackoffice from "../Componentes/Dashboard/DashboardBackoffice";
import DashboardEmpleador from "../Componentes/Dashboard/DashboardEmpleador";

// Clientes
import Clientes from "../Componentes/Clientes/Clientes";
import ClienteForm from "../Componentes/Clientes/ClientesForm";

// Cuentas
import CuentasLayout from "../Paginas/CuentasLayout";
import CuentasCobrar from "../Paginas/Cuentas/CuentasCobrar";
import CuentasPagar from "../Paginas/Cuentas/CuentasPagar";
import AplicarCobro from "../Paginas/Cuentas/AplicarCobro";
import AplicarPago from "../Paginas/Cuentas/AplicarPago";

// Admin
import AdminLayout from "../Paginas/AdminLayout";
import AdminRoles from "../Paginas/Admin/AdminRoles";
import AdminUsuarios from "../Paginas/Admin/AdminUsuarios";

import Login from "../Componentes/Login";

import { useAuth } from "../Context/AuthContext";
import type { JSX } from "react";
import VencimientosCxp from "../Paginas/Cuentas/VencimientosCxp";
import UsuariosList from "../Paginas/Seguridad/UsuariosList";
import UsuarioForm from "../Paginas/Seguridad/UsuarioForm";
import RolPermisos from "../Paginas/Seguridad/RolPermisos";
import EmpresasList from "../Paginas/Empresas/EmpresasList";
import EmpresaForm from "../Paginas/Empresas/EmpresaForm";
import ProveedoresList from "../Paginas/Proveedores/ProveedoresList";
import ProveedorForm from "../Paginas/Proveedores/ProveedorForm";
import UsuariosPage from "../Paginas/Seguridad/UsuariosPage";
import RolesPage from "../Paginas/Seguridad/RolesPage";
import EmpresaNew from "../Paginas/Empresas/EmpresaNew";
import EmpresaDetail from "../Paginas/Empresas/EmpresaDetail";
import CxcEmpresaDetail from "../Paginas/Cuentas/CxCPorClientes";
import CxCPorClientes from "../Paginas/Cuentas/CxCPorClientes";
import RegistroConsumoPage from "../Paginas/Consumos/RegistroConsumoPage";
import ConsumosListPage from "../Paginas/Consumos/ConsumosListPage";
import ProveedorDetailPage from "../Paginas/Proveedores/ProveedorDetailPage";
import TiendaEditPage from "../Paginas/Proveedores/TiendaEditPage";
import TiendaDetailPage from "../Paginas/Tienda/TiendaDetailPage";
import CajaDetailPage from "../Paginas/Tienda/CajaDetailPage";
import AdminConsumosPage from "../Paginas/Consumos/AdminConsumosPage";

// Consumos Dashboard
import ConsumosListaPage from "../Paginas/Consumos/DashboardConsumos/ConsumosListaPage";
import ConsumoDetallePage from "../Paginas/Consumos/DashboardConsumos/ConsumoDetallePage";
import ReversosPage from "../Paginas/Consumos/DashboardConsumos/ReversosPage";
import ConsumosPorEmpresaPage from "../Paginas/Consumos/DashboardConsumos/ConsumosPorEmpresaPage";
import ConsumosPorClientePage from "../Paginas/Consumos/DashboardConsumos/ConsumosPorClientePage";
import ConsumosPorProveedorPage from "../Paginas/Consumos/DashboardConsumos/ConsumosPorProveedorPage";
import ReportesConsumosPage from "../Paginas/Consumos/DashboardConsumos/ReportesConsumosPage";
import ReporteDiarioPage from "../Paginas/Consumos/DashboardConsumos/ReporteDiarioPage";
import ReportePeriodoPage from "../Paginas/Consumos/DashboardConsumos/ReportePeriodoPage";
import DashboardConsumosPage from "../Paginas/Consumos/DashboardConsumos/DashboardConsumosPage";

// Pagos
import {
  DashboardPagosPage,
  DocumentoCxcDetailPage,
  GenerarConsolidadoCxpPage,
  RefinanciamientoDetailPage,
  ReportesPagosPage,
} from "../Paginas/Pagos";
import ConfiguracionCortesPage from "../Paginas/Pagos/ConfiguracionCortesPage";
import ReporteHistoricoCobrosPage from "../Paginas/Pagos/ReporteHistoricoCobrosPage";
import ReporteHistoricoPagosPage from "../Paginas/Pagos/ReporteHistoricoPagosPage";
import ReporteFlujoCajaPage from "../Paginas/Pagos/ReporteFlujoCajaPage";
import MisEstadisticasPage from "../Componentes/Cajeros/MisEstadisticasPage";
import CxcEmpresasPage from "../Paginas/Pagos/CxcEmpresasPage";
import ReporteComisionesPage from "../Paginas/Reportes/ReporteComisionesPage";
import RefinanciamientosListPage from "../Paginas/Pagos/Refinanciamiento/RefinanciamientosListPage";
import CxpProveedoresPage from "../Paginas/Pagos/CxpProveedoresPage";
import GenerarConsolidadoCxcPage from "../Paginas/Pagos/GenerarConsolidadoCxcPage";
import CxcEmpresaDocumentosPage from "../Paginas/Pagos/CxcEmpresaDocumentosPage";
import HistorialCobrosCxcPage from "../Paginas/Pagos/HistorialCobrosCxcPage";
import CxpProveedorDocumentosPage from "../Paginas/Pagos/CxpProveedorDocumentosPage";
import RegistrarPagoCxpPage from "../Paginas/Pagos/RegistrarPagoCxpPage";
import HistorialPagosCxpPage from "../Paginas/Pagos/HistorialPagosCxpPage";
import RegistrarPagoRefinanciamientoPage from "../Paginas/Pagos/Refinanciamiento/RegistrarPagoRefinanciamientoPage";
import RegistrarCobroCxcPage from "../Paginas/Pagos/RegistrarCobroCxcPage";
import CxpDocumentoDetailPage from "../Paginas/Pagos/CxpDocumentoDetailPage";

// Reportes
import ReportesPage from "../Paginas/Reportes/ReportesPage";
import ReporteConsumosPage from "../Paginas/Reportes/ReporteConsumosPage";
import ReporteCobrosCxcPage from "../Paginas/Reportes/ReporteCobrosCxcPage";
import ReportePagosCxpPage from "../Paginas/Reportes/ReportePagosCxpPage";
import ReporteAntiguedadCxcPage from "../Paginas/Reportes/ReporteAntiguedadCxcPage";
import ReporteAntiguedadCxpPage from "../Paginas/Reportes/ReporteAntiguedadCxpPage";
import ReporteRefinanciamientosPage from "../Paginas/Reportes/ReporteRefinanciamientosPage";

// Empleador
import DocumentoEmpleadorDetailPage from "../Paginas/Empleador/DocumentoEmpleadorDetailPage";
import ReporteEmpleadosPage from "../Paginas/Empleador/ReporteEmpleadosPage";
import ReportePeriodoEmpleadorPage from "../Paginas/Empleador/ReportePeriodoPage";
import HistorialPagosEmpleadorPage from "../Paginas/Empleador/HistorialPagosPage";


function RequirePermission({
  code,
  children,
}: {
  code: string;
  children: JSX.Element;
}) {
  const { hasPermission, esCajero } = useAuth();
  
  // Los cajeros tienen acceso a registrar_consumo y consumos_ver por defecto
  const permisosImplicitosCajero = ["registrar_consumo", "consumos_ver"];
  
  if (esCajero && permisosImplicitosCajero.includes(code)) {
    return children;
  }
  
  return hasPermission(code) ? children : <Navigate to="/dashboard" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* ========== RUTA PARA CAJEROS (sin DashboardLayout) ========== /}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard-cajero" element={<DashboardCajero />} />
      </Route>

      {/* ========== RUTAS PARA EMPLEADOR (sin DashboardLayout) ========== /}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard-empleador" element={<DashboardEmpleador />} />
        <Route path="/empleador/documentos/:id" element={<DocumentoEmpleadorDetailPage />} />
        <Route path="/empleador/reporte-empleados" element={<ReporteEmpleadosPage />} />
        <Route path="/empleador/reporte-periodo" element={<ReportePeriodoEmpleadorPage />} />
        <Route path="/empleador/historial-pagos" element={<HistorialPagosEmpleadorPage />} />
      </Route>

      {/* ========== RUTAS PARA BACKOFFICE (sin DashboardLayout) ========== /}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard-backoffice" element={<DashboardBackoffice />} />
      </Route>

      {/* ========== RUTAS PRINCIPALES CON LAYOUT ========== /}
      <Route element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route
            path="/cuentas/pagar"
            element={
              <RequirePermission code="cuentas_por_pagar">
                <CuentasPagar />
              </RequirePermission>
            }
          />

          <Route path="/mis-estadisticas" element={<MisEstadisticasPage />} />

          <Route path="/pagos/configuracion-cortes" element={<ConfiguracionCortesPage />} />

          <Route path="/cxc/pendientes" element={<CuentasCobrar />} />

          <Route path="/seguridad/usuarios" element={<UsuariosList />} />
          <Route path="/seguridad/usuarios/:id" element={<UsuarioForm />} />

          <Route
            path="/cuentas/cobrar"
            element={
              <RequirePermission code="cuentas_por_cobrar">
                <CuentasCobrar />
              </RequirePermission>
            }
          />

          {/* Empresas /}
          <Route path="/empresas" element={<EmpresasList />} />
          <Route path="/empresas/:id/editar" element={<EmpresaForm />} />
          <Route path="/empresas/nueva" element={<EmpresaNew />} />
          <Route path="/empresas/:id" element={<EmpresaDetail />} />
          <Route path="/cxc/empresa/:empresaId" element={<CxcEmpresaDetail />} />
          <Route path="/cxc/empresa/:empresaId/clientes" element={<CxCPorClientes />} />

          {/* Proveedores /}
          <Route path="/proveedores" element={<ProveedoresList />} />
          <Route path="/proveedores/nuevo" element={<ProveedorForm />} />
          <Route path="/proveedores/:id" element={<ProveedorDetailPage />} />
          <Route path="/proveedores/:id/tiendas" element={<ProveedorDetailPage />} />
          <Route path="/proveedores/:id/tiendas/:tiendaId/editar" element={<TiendaEditPage />} />
          <Route path="/proveedores/:id/tiendas/:tiendaId" element={<TiendaDetailPage />} />
          <Route path="/proveedores/:id/tiendas/:tiendaId/cajas/:cajaId" element={<CajaDetailPage />} />

          {/* Vencimientos /}
          <Route
            path="/cxp/vencimientos"
            element={
              <RequirePermission code="reporte_vencimientos_cxp">
                <VencimientosCxp />
              </RequirePermission>
            }
          />

          {/* Clientes /}
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/clientes/nuevo" element={<ClienteForm />} />
          <Route path="/clientes/editar/:id" element={<ClienteForm />} />

          {/* Cuentas (tabs) /}
          <Route path="/cuentas" element={<CuentasLayout />}>
            <Route index element={<Navigate to="cobrar" replace />} />
            <Route path="cobrar" element={<CuentasCobrar />} />
            <Route path="aplicar-cobro" element={<AplicarCobro />} />
            <Route path="pagar" element={<CuentasPagar />} />
            <Route path="aplicar-pago" element={<AplicarPago />} />
          </Route>

          {/* Admin (tabs) /}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="usuarios" replace />} />
            <Route path="usuarios" element={<AdminUsuarios />} />
            <Route path="roles" element={<AdminRoles />} />
          </Route>

          {/* Seguridad /}
          <Route path="/seguridad/usuarios" element={<UsuariosPage />} />
          <Route path="/seguridad/roles" element={<RolesPage />} />
          <Route path="/seguridad/roles/:id" element={<RolPermisos />} />

          {/* Consumos /}
          <Route
            path="/consumos/nuevo"
            element={
              <RequirePermission code="registrar_consumo">
                <RegistroConsumoPage />
              </RequirePermission>
            }
          />
          <Route path="/admin/consumos" element={<AdminConsumosPage />} />
          <Route
            path="/consumos"
            element={
              <RequirePermission code="consumos_ver">
                <ConsumosListPage />
              </RequirePermission>
            }
          />

          {/* ========== MÓDULO DE CONSUMOS ========== /}
          <Route path="/modulo-consumos" element={<DashboardConsumosPage />} />
          <Route path="/modulo-consumos/lista" element={<ConsumosListaPage />} />
          <Route path="/modulo-consumos/:id" element={<ConsumoDetallePage />} />
          <Route path="/modulo-consumos/reversos" element={<ReversosPage />} />
          <Route path="/modulo-consumos/por-empresa" element={<ConsumosPorEmpresaPage />} />
          <Route path="/modulo-consumos/por-cliente" element={<ConsumosPorClientePage />} />
          <Route path="/modulo-consumos/por-proveedor" element={<ConsumosPorProveedorPage />} />
          <Route path="/modulo-consumos/reportes" element={<ReportesConsumosPage />} />
          <Route path="/modulo-consumos/reportes/diario" element={<ReporteDiarioPage />} />
          <Route path="/modulo-consumos/reportes/periodo" element={<ReportePeriodoPage />} />

          {/* ========== MÓDULO DE PAGOS ========== /}
          <Route path="/pagos" element={<DashboardPagosPage />} />

          {/* CxC - Cuentas por Cobrar /}
          <Route path="/pagos/cxc" element={<CxcEmpresasPage />} />
          <Route path="/pagos/cxc/empresas/:empresaId" element={<CxcEmpresaDocumentosPage />} />
          <Route path="/pagos/cxc/empresas/:empresaId/cobrar" element={<RegistrarCobroCxcPage />} />
          <Route path="/pagos/cxc/documentos/:id" element={<DocumentoCxcDetailPage />} />
          <Route path="/pagos/cxc/documentos/:id/cobrar" element={<RegistrarCobroCxcPage />} />
          <Route path="/pagos/cxc/generar" element={<GenerarConsolidadoCxcPage />} />
          <Route path="/pagos/cxc/historial" element={<HistorialCobrosCxcPage />} />

          {/* CxP - Cuentas por Pagar /}
          <Route path="/pagos/cxp" element={<CxpProveedoresPage />} />
          <Route path="/pagos/cxp/proveedores/:proveedorId" element={<CxpProveedorDocumentosPage />} />
          <Route path="/pagos/cxp/proveedores/:proveedorId/pagar" element={<RegistrarPagoCxpPage />} />
          <Route path="/pagos/cxp/documentos/:id" element={<CxpDocumentoDetailPage />} />
          <Route path="/pagos/cxp/documentos/:id/pagar" element={<RegistrarPagoCxpPage />} />
          <Route path="/pagos/cxp/generar" element={<GenerarConsolidadoCxpPage />} />
          <Route path="/pagos/cxp/historial" element={<HistorialPagosCxpPage />} />

          {/* Refinanciamientos /}
          <Route path="/pagos/refinanciamientos" element={<RefinanciamientosListPage />} />
          <Route path="/pagos/refinanciamientos/:id" element={<RefinanciamientoDetailPage />} />
          <Route path="/pagos/refinanciamientos/:id/pagar" element={<RegistrarPagoRefinanciamientoPage />} />

          {/* Reportes de Pagos /}
          <Route path="/pagos/reportes" element={<ReportesPagosPage />} />
          <Route path="/pagos/reportes/antiguedad-cxc" element={<ReporteAntiguedadCxcPage />} />
          <Route path="/pagos/reportes/antiguedad-cxp" element={<ReporteAntiguedadCxpPage />} />
          <Route path="/pagos/reportes/comisiones" element={<ReporteComisionesPage />} />
          <Route path="/pagos/reportes/historial" element={<ReporteHistoricoPagosPage />} />
          <Route path="/pagos/reportes/historico-cobros" element={<ReporteHistoricoCobrosPage />} />
          <Route path="/pagos/reportes/flujo-caja" element={<ReporteFlujoCajaPage />} />
          <Route path="/pagos/reportes/cobros-cxc" element={<ReporteCobrosCxcPage />} />
          <Route path="/pagos/reportes/pagos-cxp" element={<ReportePagosCxpPage />} />
          <Route path="/pagos/reportes/refinanciamientos" element={<ReporteRefinanciamientosPage />} />

          {/* Configuración de Pagos /}
          <Route path="/pagos/configuracion-cortes" element={<ConfiguracionCortesPage />} />

          {/* ========== REPORTES GENERALES ========== /}
          <Route path="/reportes" element={<ReportesPage />} />
          <Route path="/reportes/consumos" element={<ReporteConsumosPage />} />
          <Route path="/reportes/cobros-cxc" element={<ReporteCobrosCxcPage />} />
          <Route path="/reportes/pagos-cxp" element={<ReportePagosCxpPage />} />
          <Route path="/reportes/antiguedad-cxc" element={<ReporteAntiguedadCxcPage />} />
          <Route path="/reportes/antiguedad-cxp" element={<ReporteAntiguedadCxpPage />} />
          <Route path="/reportes/refinanciamientos" element={<ReporteRefinanciamientosPage />} />

        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
} */

  

import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import DashboardLayout from "../Layouts/DashboardLayout";

// Páginas principales
import Dashboard from "../Componentes/Dashboard/Dashboard";
import DashboardCajero from "../Componentes/Dashboard/DashboardCajero";
import DashboardBackoffice from "../Componentes/Dashboard/DashboardBackoffice";
import DashboardEmpleador from "../Componentes/Dashboard/DashboardEmpleador";
import DashboardEmpleadoPersonal from "../Componentes/Dashboard/DashboardEmpleadoPersonal";

// Auth
import Login from "../Componentes/Login";


// Clientes
import Clientes from "../Componentes/Clientes/Clientes";
import ClienteForm from "../Componentes/Clientes/ClientesForm";

// Cuentas
import CuentasLayout from "../Paginas/CuentasLayout";
import CuentasCobrar from "../Paginas/Cuentas/CuentasCobrar";
import CuentasPagar from "../Paginas/Cuentas/CuentasPagar";
import AplicarCobro from "../Paginas/Cuentas/AplicarCobro";
import AplicarPago from "../Paginas/Cuentas/AplicarPago";

// Admin
import AdminLayout from "../Paginas/AdminLayout";
import AdminRoles from "../Paginas/Admin/AdminRoles";
import AdminUsuarios from "../Paginas/Admin/AdminUsuarios";
import AdminClientesAccesoPage from "../Paginas/Admin/AdminClientesAccesoPage";

import { useAuth } from "../Context/AuthContext";
import type { JSX } from "react";
import VencimientosCxp from "../Paginas/Cuentas/VencimientosCxp";
import UsuariosList from "../Paginas/Seguridad/UsuariosList";
import UsuarioForm from "../Paginas/Seguridad/UsuarioForm";
import RolPermisos from "../Paginas/Seguridad/RolPermisos";
import EmpresasList from "../Paginas/Empresas/EmpresasList";
import EmpresaForm from "../Paginas/Empresas/EmpresaForm";
import ProveedoresList from "../Paginas/Proveedores/ProveedoresList";
import ProveedorForm from "../Paginas/Proveedores/ProveedorForm";
import UsuariosPage from "../Paginas/Seguridad/UsuariosPage";
import RolesPage from "../Paginas/Seguridad/RolesPage";
import EmpresaNew from "../Paginas/Empresas/EmpresaNew";
import EmpresaDetail from "../Paginas/Empresas/EmpresaDetail";
import CxcEmpresaDetail from "../Paginas/Cuentas/CxCPorClientes";
import CxCPorClientes from "../Paginas/Cuentas/CxCPorClientes";
import RegistroConsumoPage from "../Paginas/Consumos/RegistroConsumoPage";
import ConsumosListPage from "../Paginas/Consumos/ConsumosListPage";
import ProveedorDetailPage from "../Paginas/Proveedores/ProveedorDetailPage";
import TiendaEditPage from "../Paginas/Proveedores/TiendaEditPage";
import TiendaDetailPage from "../Paginas/Tienda/TiendaDetailPage";
import CajaDetailPage from "../Paginas/Tienda/CajaDetailPage";
import AdminConsumosPage from "../Paginas/Consumos/AdminConsumosPage";

// Consumos Dashboard
import ConsumosListaPage from "../Paginas/Consumos/DashboardConsumos/ConsumosListaPage";
import ConsumoDetallePage from "../Paginas/Consumos/DashboardConsumos/ConsumoDetallePage";
import ReversosPage from "../Paginas/Consumos/DashboardConsumos/ReversosPage";
import ConsumosPorEmpresaPage from "../Paginas/Consumos/DashboardConsumos/ConsumosPorEmpresaPage";
import ConsumosPorClientePage from "../Paginas/Consumos/DashboardConsumos/ConsumosPorClientePage";
import ConsumosPorProveedorPage from "../Paginas/Consumos/DashboardConsumos/ConsumosPorProveedorPage";
import ReportesConsumosPage from "../Paginas/Consumos/DashboardConsumos/ReportesConsumosPage";
import ReporteDiarioPage from "../Paginas/Consumos/DashboardConsumos/ReporteDiarioPage";
import ReportePeriodoPage from "../Paginas/Consumos/DashboardConsumos/ReportePeriodoPage";
import DashboardConsumosPage from "../Paginas/Consumos/DashboardConsumos/DashboardConsumosPage";

// Pagos
import {
  DashboardPagosPage,
  DocumentoCxcDetailPage,
  GenerarConsolidadoCxpPage,
  RefinanciamientoDetailPage,
  ReportesPagosPage,
} from "../Paginas/Pagos";
import ConfiguracionCortesPage from "../Paginas/Pagos/ConfiguracionCortesPage";
import ReporteHistoricoCobrosPage from "../Paginas/Pagos/ReporteHistoricoCobrosPage";
import ReporteHistoricoPagosPage from "../Paginas/Pagos/ReporteHistoricoPagosPage";
import ReporteFlujoCajaPage from "../Paginas/Pagos/ReporteFlujoCajaPage";
import MisEstadisticasPage from "../Componentes/Cajeros/MisEstadisticasPage";
import CxcEmpresasPage from "../Paginas/Pagos/CxcEmpresasPage";
import ReporteComisionesPage from "../Paginas/Reportes/ReporteComisionesPage";
import RefinanciamientosListPage from "../Paginas/Pagos/Refinanciamiento/RefinanciamientosListPage";
import CxpProveedoresPage from "../Paginas/Pagos/CxpProveedoresPage";
import GenerarConsolidadoCxcPage from "../Paginas/Pagos/GenerarConsolidadoCxcPage";
import CxcEmpresaDocumentosPage from "../Paginas/Pagos/CxcEmpresaDocumentosPage";
import HistorialCobrosCxcPage from "../Paginas/Pagos/HistorialCobrosCxcPage";
import CxpProveedorDocumentosPage from "../Paginas/Pagos/CxpProveedorDocumentosPage";
import RegistrarPagoCxpPage from "../Paginas/Pagos/RegistrarPagoCxpPage";
import HistorialPagosCxpPage from "../Paginas/Pagos/HistorialPagosCxpPage";
import RegistrarPagoRefinanciamientoPage from "../Paginas/Pagos/Refinanciamiento/RegistrarPagoRefinanciamientoPage";
import RegistrarCobroCxcPage from "../Paginas/Pagos/RegistrarCobroCxcPage";
import CxpDocumentoDetailPage from "../Paginas/Pagos/CxpDocumentoDetailPage";

// Reportes
import ReportesPage from "../Paginas/Reportes/ReportesPage";
import ReporteConsumosPage from "../Paginas/Reportes/ReporteConsumosPage";
import ReporteCobrosCxcPage from "../Paginas/Reportes/ReporteCobrosCxcPage";
import ReportePagosCxpPage from "../Paginas/Reportes/ReportePagosCxpPage";
import ReporteAntiguedadCxcPage from "../Paginas/Reportes/ReporteAntiguedadCxcPage";
import ReporteAntiguedadCxpPage from "../Paginas/Reportes/ReporteAntiguedadCxpPage";
import ReporteRefinanciamientosPage from "../Paginas/Reportes/ReporteRefinanciamientosPage";

// Empleador
import DocumentoEmpleadorDetailPage from "../Paginas/Empleador/DocumentoEmpleadorDetailPage";
import ReporteEmpleadosPage from "../Paginas/Empleador/ReporteEmpleadosPage";
import ReportePeriodoEmpleadorPage from "../Paginas/Empleador/ReportePeriodoPage";
import HistorialPagosEmpleadorPage from "../Paginas/Empleador/HistorialPagosPage";

// Backoffice (Proveedor)
import ReporteCajerosBackofficePage from "../Paginas/Backoffice/ReporteCajerosPage";
import ReporteTiendasBackofficePage from "../Paginas/Backoffice/ReporteTiendasPage";
import CambiarContrasenaPage from "../Context/CambiarContrasenaPage";


function RequirePermission({ code, children }: { code: string; children: JSX.Element }) {
  const { hasPermission, esCajero } = useAuth();
  const permisosImplicitosCajero = ["registrar_consumo", "consumos_ver"];
  
  if (esCajero && permisosImplicitosCajero.includes(code)) {
    return children;
  }
  
  return hasPermission(code) ? children : <Navigate to="/dashboard" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* ========== CAMBIAR CONTRASEÑA (requiere auth) ========== */}
      <Route element={<PrivateRoute />}>
        <Route path="/cambiar-contrasena" element={<CambiarContrasenaPage />} />
      </Route>

      {/* ========== CAJEROS (sin DashboardLayout) ========== */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard-cajero" element={<DashboardCajero />} />
      </Route>

      {/* ========== EMPLEADOR (sin DashboardLayout) ========== */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard-empleador" element={<DashboardEmpleador />} />
        <Route path="/empleador/documentos/:id" element={<DocumentoEmpleadorDetailPage />} />
        <Route path="/empleador/reporte-empleados" element={<ReporteEmpleadosPage />} />
        <Route path="/empleador/reporte-periodo" element={<ReportePeriodoEmpleadorPage />} />
        <Route path="/empleador/historial-pagos" element={<HistorialPagosEmpleadorPage />} />
      </Route>

      {/* ========== BACKOFFICE / PROVEEDOR (sin DashboardLayout) ========== */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard-backoffice" element={<DashboardBackoffice />} />
        <Route path="/backoffice/reporte-cajeros" element={<ReporteCajerosBackofficePage />} />
        <Route path="/backoffice/reporte-tiendas" element={<ReporteTiendasBackofficePage />} />
      </Route>

      {/* ========== EMPLEADO PERSONAL (sin DashboardLayout) ========== */}
      <Route element={<PrivateRoute />}>
        <Route path="/mi-cuenta" element={<DashboardEmpleadoPersonal />} />
      </Route>

      {/* ========== RUTAS PRINCIPALES CON LAYOUT ========== */}
      <Route element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/cuentas/pagar" element={<RequirePermission code="cuentas_por_pagar"><CuentasPagar /></RequirePermission>} />
          <Route path="/mis-estadisticas" element={<MisEstadisticasPage />} />
          <Route path="/pagos/configuracion-cortes" element={<ConfiguracionCortesPage />} />
          <Route path="/cxc/pendientes" element={<CuentasCobrar />} />
          <Route path="/seguridad/usuarios" element={<UsuariosList />} />
          <Route path="/seguridad/usuarios/:id" element={<UsuarioForm />} />
          <Route path="/cuentas/cobrar" element={<RequirePermission code="cuentas_por_cobrar"><CuentasCobrar /></RequirePermission>} />

          {/* Empresas */}
          <Route path="/empresas" element={<EmpresasList />} />
          <Route path="/empresas/:id/editar" element={<EmpresaForm />} />
          <Route path="/empresas/nueva" element={<EmpresaNew />} />
          <Route path="/empresas/:id" element={<EmpresaDetail />} />
          <Route path="/cxc/empresa/:empresaId" element={<CxcEmpresaDetail />} />
          <Route path="/cxc/empresa/:empresaId/clientes" element={<CxCPorClientes />} />

          {/* Proveedores */}
          <Route path="/proveedores" element={<ProveedoresList />} />
          <Route path="/proveedores/nuevo" element={<ProveedorForm />} />
          <Route path="/proveedores/:id" element={<ProveedorDetailPage />} />
          <Route path="/proveedores/:id/tiendas" element={<ProveedorDetailPage />} />
          <Route path="/proveedores/:id/tiendas/:tiendaId/editar" element={<TiendaEditPage />} />
          <Route path="/proveedores/:id/tiendas/:tiendaId" element={<TiendaDetailPage />} />
          <Route path="/proveedores/:id/tiendas/:tiendaId/cajas/:cajaId" element={<CajaDetailPage />} />

          {/* Vencimientos */}
          <Route path="/cxp/vencimientos" element={<RequirePermission code="reporte_vencimientos_cxp"><VencimientosCxp /></RequirePermission>} />

          {/* Clientes */}
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/clientes/nuevo" element={<ClienteForm />} />
          <Route path="/clientes/editar/:id" element={<ClienteForm />} />

          {/* Cuentas (tabs) */}
          <Route path="/cuentas" element={<CuentasLayout />}>
            <Route index element={<Navigate to="cobrar" replace />} />
            <Route path="cobrar" element={<CuentasCobrar />} />
            <Route path="aplicar-cobro" element={<AplicarCobro />} />
            <Route path="pagar" element={<CuentasPagar />} />
            <Route path="aplicar-pago" element={<AplicarPago />} />
          </Route>

          {/* Admin (tabs) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="usuarios" replace />} />
            <Route path="usuarios" element={<AdminUsuarios />} />
            <Route path="roles" element={<AdminRoles />} />
          </Route>

          {/* Admin - Gestión de accesos de clientes */}
          <Route path="/admin/clientes-acceso" element={<AdminClientesAccesoPage />} />

          {/* Seguridad */}
          <Route path="/seguridad/usuarios" element={<UsuariosPage />} />
          <Route path="/seguridad/roles" element={<RolesPage />} />
          <Route path="/seguridad/roles/:id" element={<RolPermisos />} />

          {/* Consumos */}
          <Route path="/consumos/nuevo" element={<RequirePermission code="registrar_consumo"><RegistroConsumoPage /></RequirePermission>} />
          <Route path="/admin/consumos" element={<AdminConsumosPage />} />
          <Route path="/consumos" element={<RequirePermission code="consumos_ver"><ConsumosListPage /></RequirePermission>} />

          {/* Módulo de Consumos */}
          <Route path="/modulo-consumos" element={<DashboardConsumosPage />} />
          <Route path="/modulo-consumos/lista" element={<ConsumosListaPage />} />
          <Route path="/modulo-consumos/:id" element={<ConsumoDetallePage />} />
          <Route path="/modulo-consumos/reversos" element={<ReversosPage />} />
          <Route path="/modulo-consumos/por-empresa" element={<ConsumosPorEmpresaPage />} />
          <Route path="/modulo-consumos/por-cliente" element={<ConsumosPorClientePage />} />
          <Route path="/modulo-consumos/por-proveedor" element={<ConsumosPorProveedorPage />} />
          <Route path="/modulo-consumos/reportes" element={<ReportesConsumosPage />} />
          <Route path="/modulo-consumos/reportes/diario" element={<ReporteDiarioPage />} />
          <Route path="/modulo-consumos/reportes/periodo" element={<ReportePeriodoPage />} />

          {/* Módulo de Pagos */}
          <Route path="/pagos" element={<DashboardPagosPage />} />
          <Route path="/pagos/cxc" element={<CxcEmpresasPage />} />
          <Route path="/pagos/cxc/empresas/:empresaId" element={<CxcEmpresaDocumentosPage />} />
          <Route path="/pagos/cxc/empresas/:empresaId/cobrar" element={<RegistrarCobroCxcPage />} />
          <Route path="/pagos/cxc/documentos/:id" element={<DocumentoCxcDetailPage />} />
          <Route path="/pagos/cxc/documentos/:id/cobrar" element={<RegistrarCobroCxcPage />} />
          <Route path="/pagos/cxc/generar" element={<GenerarConsolidadoCxcPage />} />
          <Route path="/pagos/cxc/historial" element={<HistorialCobrosCxcPage />} />
          <Route path="/pagos/cxp" element={<CxpProveedoresPage />} />
          <Route path="/pagos/cxp/proveedores/:proveedorId" element={<CxpProveedorDocumentosPage />} />
          <Route path="/pagos/cxp/proveedores/:proveedorId/pagar" element={<RegistrarPagoCxpPage />} />
          <Route path="/pagos/cxp/documentos/:id" element={<CxpDocumentoDetailPage />} />
          <Route path="/pagos/cxp/documentos/:id/pagar" element={<RegistrarPagoCxpPage />} />
          <Route path="/pagos/cxp/generar" element={<GenerarConsolidadoCxpPage />} />
          <Route path="/pagos/cxp/historial" element={<HistorialPagosCxpPage />} />
          <Route path="/pagos/refinanciamientos" element={<RefinanciamientosListPage />} />
          <Route path="/pagos/refinanciamientos/:id" element={<RefinanciamientoDetailPage />} />
          <Route path="/pagos/refinanciamientos/:id/pagar" element={<RegistrarPagoRefinanciamientoPage />} />
          <Route path="/pagos/reportes" element={<ReportesPagosPage />} />
          <Route path="/pagos/reportes/antiguedad-cxc" element={<ReporteAntiguedadCxcPage />} />
          <Route path="/pagos/reportes/antiguedad-cxp" element={<ReporteAntiguedadCxpPage />} />
          <Route path="/pagos/reportes/comisiones" element={<ReporteComisionesPage />} />
          <Route path="/pagos/reportes/historial" element={<ReporteHistoricoPagosPage />} />
          <Route path="/pagos/reportes/historico-cobros" element={<ReporteHistoricoCobrosPage />} />
          <Route path="/pagos/reportes/flujo-caja" element={<ReporteFlujoCajaPage />} />
          <Route path="/pagos/reportes/cobros-cxc" element={<ReporteCobrosCxcPage />} />
          <Route path="/pagos/reportes/pagos-cxp" element={<ReportePagosCxpPage />} />
          <Route path="/pagos/reportes/refinanciamientos" element={<ReporteRefinanciamientosPage />} />
          <Route path="/pagos/configuracion-cortes" element={<ConfiguracionCortesPage />} />

          {/* Reportes Generales */}
          <Route path="/reportes" element={<ReportesPage />} />
          <Route path="/reportes/consumos" element={<ReporteConsumosPage />} />
          <Route path="/reportes/cobros-cxc" element={<ReporteCobrosCxcPage />} />
          <Route path="/reportes/pagos-cxp" element={<ReportePagosCxpPage />} />
          <Route path="/reportes/antiguedad-cxc" element={<ReporteAntiguedadCxcPage />} />
          <Route path="/reportes/antiguedad-cxp" element={<ReporteAntiguedadCxpPage />} />
          <Route path="/reportes/refinanciamientos" element={<ReporteRefinanciamientosPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}