import {
  Card,
  PageHeader,
  StatCard,
  StatusBadge,
  styles,
} from "@/components/prototype/PrototypeUi";

import { commercialGroups } from "@/lib/prototype-v2-data";

export default function CommercialGroupsPage() {
  return (
    <main className={styles.page}>
      <PageHeader
        eyebrow="Comercial"
        title="Grupos Comerciales"
        description="Consulta de grupos económicos utilizados para aplicar condiciones y tarifas compartidas."
      />

      <div className={styles.statsGrid}>
        <StatCard label="Grupos activos" value="21" />
        <StatCard label="Empresas agrupadas" value="68" />
        <StatCard label="Tarifas de grupo" value="32" />
        <StatCard label="Acuerdos por vencer" value="4" />
      </div>

      <Card title="Grupos económicos" subtitle="Condiciones compartidas">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Grupo</th>
                <th>Empresas</th>
                <th>Representante</th>
                <th>Tipo de tarifa</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {commercialGroups.map((group) => (
                <tr key={group.code}>
                  <td>{group.code}</td>
                  <td>{group.name}</td>
                  <td>{group.members}</td>
                  <td>{group.representative}</td>
                  <td>{group.tariffType}</td>
                  <td>
                    <StatusBadge tone="success">{group.status}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}
