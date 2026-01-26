
import api from "../../Servicios/api";
import type { ClienteBusquedaGlobal, Opcion, RegistrarConsumoDto } from "../../types/consumos";

export async function buscarClientePorCedulaGlobal(cedula: string) {
  const clean = (cedula ?? "").replace(/\D/g, "");
  const { data } = await api.get<ClienteBusquedaGlobal>(`/clientes/cedula/${encodeURIComponent(clean)}`);
  return data;
}

export async function getMisProveedores() {
  const { data } = await api.get<Opcion[]>(`/mis/proveedores`);
  return data;
}

export async function getMisTiendas(proveedorId: number) {
  const { data } = await api.get<Opcion[]>(`/mis/tiendas`, { params: { proveedorId } });
  return data;
}

export async function getMisCajas(proveedorId: number, tiendaId: number) {
  const { data } = await api.get<Opcion[]>(`/mis/cajas`, { params: { proveedorId, tiendaId } });
  return data;
}

export async function postRegistrarConsumo(payload: RegistrarConsumoDto) {
  const { data } = await api.post<{ id: number }>(`/consumos`, payload);
  return data;
}