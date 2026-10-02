import {
  Card,
  PageHeader,
  StatCard,
  StatusBadge,
  styles,
} from "@/components/prototype/PrototypeUi";

import { users } from "@/lib/prototype-v2-data";

export default function UsersPage() {
  return (
    <main className={styles.page}>
      <PageHeader
        eyebrow="Administración"
        title="Usuarios y Perfiles"
        description="Perfiles, alcance de información y origen del dato maestro de vendedores."
      />

      <div className={styles.statsGrid}>
        <StatCard label="Usuarios activos" value="18" />
        <StatCard label="Representantes" value="9" />
        <StatCard label="Supervisores" value="3" />
        <StatCard label="Directores / Admin" value="6" />
      </div>

      <Card title="Usuarios del sistema" subtitle="Perfiles y alcance">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Perfil</th>
                <th>Alcance</th>
                <th>Equipo</th>
                <th>Origen dato maestro</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.name}>
                  <td>{user.name}</td>
                  <td>{user.profile}</td>
                  <td>{user.scope}</td>
                  <td>{user.team}</td>
                  <td>{user.origin}</td>
                  <td>
                    <StatusBadge
                      tone={user.origin === "Pendiente confirmar" ? "warning" : "success"}
                    >
                      {user.status}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className={styles.sectionSpacer}>
        <div className={styles.notice}>
          Pendiente de definición funcional: confirmar si el alta de representantes comerciales se origina en Waldbott o en el Sistema Tarifario.
        </div>
      </div>
    </main>
  );
}
