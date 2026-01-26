// src/Servicios/lookupApi.ts
//import axios from "axios";
import api from "./api";

export type LookupItem = { value: string; label: string };
export type PagedLookup = { data: LookupItem[]; page: number; pageSize: number; total: number };

export const lookupApi = {
  empresas: (q = "", page = 1, pageSize = 10, activeOnly = true) =>
    api.get<PagedLookup>("/api/empresas/lookup", { params: { q, page, pageSize, activeOnly } })
         .then(r => r.data),

  proveedores: (q = "", page = 1, pageSize = 10, activeOnly = true) =>
    api.get<PagedLookup>("/api/proveedores/lookup", { params: { q, page, pageSize, activeOnly } })
         .then(r => r.data),
};
