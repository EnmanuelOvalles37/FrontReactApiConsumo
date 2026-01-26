/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from "xlsx";


export function exportToExcel(data: any[], filename = "reporte.xlsx") {
const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Reporte");
XLSX.writeFile(wb, filename);
}


export function exportToPDF() {
alert("PDF pendiente de implementación");
}