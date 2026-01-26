export type UsuarioRow = {
  id: number;
  nombre: string;
  usuario: string;   // 👈 requerido
  rolId?: number | null;
  activo: boolean;
  rol:string;
};
