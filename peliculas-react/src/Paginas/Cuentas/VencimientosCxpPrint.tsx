import { useEffect } from "react";
import type { CxpVencProveedor } from "../../assets/types/cxp";

export default function VencimientosCxpPrint({
  rows, fechaCorte, proveedor
}: {
  rows: CxpVencProveedor[];
  fechaCorte: string;
  proveedor: string;
}) {
  useEffect(() => {
    setTimeout(() => window.print(), 250);
  }, []);

  const totals = rows.reduce((acc, r) => {
    acc.noVencido += r.noVencido;
    acc.d0_30 += r.d0_30;
    acc.d31_60 += r.d31_60;
    acc.d61_90 += r.d61_90;
    acc.d90p += r.d90p;
    acc.total += r.total;
    return acc;
  }, { noVencido:0, d0_30:0, d31_60:0, d61_90:0, d90p:0, total:0 });

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Reporte de Vencimientos CxP</h1>
      <div className="text-sm text-gray-600 mt-1">
        Corte: <b>{fechaCorte}</b>{' '}
        {proveedor && <>— Proveedor: <b>{proveedor}</b></>}
      </div>

      <table className="w-full text-xs mt-4" style={{borderCollapse:'collapse'}}>
        <thead>
          <tr>
            <th style={{border:'1px solid #999', padding:'4px', textAlign:'left'}}>Proveedor</th>
            <th style={{border:'1px solid #999', padding:'4px', textAlign:'right'}}>No vencido</th>
            <th style={{border:'1px solid #999', padding:'4px', textAlign:'right'}}>0–30</th>
            <th style={{border:'1px solid #999', padding:'4px', textAlign:'right'}}>31–60</th>
            <th style={{border:'1px solid #999', padding:'4px', textAlign:'right'}}>61–90</th>
            <th style={{border:'1px solid #999', padding:'4px', textAlign:'right'}}>&gt;90</th>
            <th style={{border:'1px solid #999', padding:'4px', textAlign:'right'}}>Total</th>
            <th style={{border:'1px solid #999', padding:'4px', textAlign:'right'}}># Docs</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.proveedorId}>
              <td style={{border:'1px solid #999', padding:'4px'}}>{r.proveedorNombre}</td>
              <td style={{border:'1px solid #999', padding:'4px', textAlign:'right'}}>{r.noVencido.toFixed(2)}</td>
              <td style={{border:'1px solid #999', padding:'4px', textAlign:'right'}}>{r.d0_30.toFixed(2)}</td>
              <td style={{border:'1px solid #999', padding:'4px', textAlign:'right'}}>{r.d31_60.toFixed(2)}</td>
              <td style={{border:'1px solid #999', padding:'4px', textAlign:'right'}}>{r.d61_90.toFixed(2)}</td>
              <td style={{border:'1px solid #999', padding:'4px', textAlign:'right'}}>{r.d90p.toFixed(2)}</td>
              <td style={{border:'1px solid #999', padding:'4px', textAlign:'right'}}>{r.total.toFixed(2)}</td>
              <td style={{border:'1px solid #999', padding:'4px', textAlign:'right'}}>{r.facturas}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{fontWeight:'bold'}}>
            <td style={{border:'1px solid #999', padding:'4px', textAlign:'right'}}>Totales:</td>
            <td style={{border:'1px solid #999', padding:'4px', textAlign:'right'}}>{totals.noVencido.toFixed(2)}</td>
            <td style={{border:'1px solid #999', padding:'4px', textAlign:'right'}}>{totals.d0_30.toFixed(2)}</td>
            <td style={{border:'1px solid #999', padding:'4px', textAlign:'right'}}>{totals.d31_60.toFixed(2)}</td>
            <td style={{border:'1px solid #999', padding:'4px', textAlign:'right'}}>{totals.d61_90.toFixed(2)}</td>
            <td style={{border:'1px solid #999', padding:'4px', textAlign:'right'}}>{totals.d90p.toFixed(2)}</td>
            <td style={{border:'1px solid #999', padding:'4px', textAlign:'right'}}>{totals.total.toFixed(2)}</td>
            <td style={{border:'1px solid #999', padding:'4px'}} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
