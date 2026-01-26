// utils/toast.ts
import toast from "react-hot-toast";
export const success = (m:string)=>toast.success(m);
export const error = (m:string)=>toast.error(m || "Ocurrió un error");
