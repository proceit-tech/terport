import {
  Card,
  PageHeader,
  StatCard,
  styles,
} from "@/components/prototype/PrototypeUi";

import { auditRows } from "@/lib/prototype-v2-data";

export default function AuditPage() {
  return (
    <main className={styles.page}>
      <PageHeader
        eyebrow="Administración"
        title="Auditoría"
        description="Trazabilidad de cambios de tarifas, pedidos, artículos y gestión comercial."
      />

      <div className={styles.statsGrid}>
        <StatCard label="Eventos hoy" value="42" />
        <StatCard label="Cambios de tarifa" value="8" />
        <StatCard label="Anulaciones" value="2" />
        <StatCard label="Comentarios dirección" value="6" />
      </div>

      <Card title="Registro de auditoría" subtitle="Trazabilidad">
        <div className={styles.toolbar}>
          <input className={styles.input} placeholder="Buscar usuario, referencia..." />

          <select className={styles.select}>
            <option>Todos los módulos</option>
            <option>Tarifas</option>
            <option>Pedidos</option>
            <option>Servicios</option>
            <option>CRM</option>
          </select>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Fecha / hora</th>
                <th>Usuario</th>
                <th>Módulo</th>
                <th>Acción</th>
                <th>Referencia</th>
                <th>Valor anterior</th>
                <th>Valor nuevo</th>
              </tr>
            </thead>

            <tbody>
              {auditRows.map((row) => (
                <tr key={`${row.date}-${row.reference}`}>
                  <td>{row.date}</td>
                  <td>{row.user}</td>
                  <td>{row.module}</td>
                  <td>{row.action}</td>
                  <td>{row.reference}</td>
                  <td>{row.previousValue}</td>
                  <td>{row.newValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}
