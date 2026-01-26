export type UsuarioList = { id:number; nombre:string; rol:string; activo:boolean };
export type UsuarioForm = { nombre:string; rolId:number; activo:boolean; contrasena?:string };