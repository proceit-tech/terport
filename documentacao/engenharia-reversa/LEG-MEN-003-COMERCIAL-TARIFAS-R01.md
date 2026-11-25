# TERPORT — LEG-MEN-003 · Comercial > Tarifas — Auditoría técnica y funcional F00/R01

**Fecha:** 2026-11-23. **Estado:** LEVANTAMIENTO ESTÁTICO DEL MENÚ ACTIVO Y SUS CUATRO APIs DIRECTAS; **AUDITORÍA DE VARIANTES HISTÓRICAS AÚN PENDIENTE**, NO HOMOLOGADO. No se toma ninguna decisión sobre qué copiar, eliminar o rediseñar en V2.  
**Fuente:** terport.zip / terport(1).zip, idénticos por SHA-256: 3e89b3e3d92549ff38990cc8296075ad3eb7788553fb5641246fc2eb6fd506a6.  
**Regla de entrega:** documentación interna del equipo en el repo de análisis **proceit-tech/terport**, rama pro-366-inventario-legado-f00, PR #2 Draft. **No** se publican archivos PHP originales, valores de configuración, secretos, datos personales ni información operativa del cliente en el repositorio público.  
**Método:** lectura estática de los archivos del ZIP, interpretación del catálogo de módulos serializado como datos, rastreo de llamadas y SQL; **sin ejecutar PHP, SQL, tests, comandos remotos, despliegue o desarrollo**.  
**Alcance:** el menú **Comercial > Tarifas** de la interfaz PHP antigua, su catálogo maestro, sus cuatro APIs genéricas y consumidores inmediatos. No equivale al menú **Comercial > Cliente Tasa** ni a la nueva tarifa por artículo, que necesitarán fichas propias.

## 1. Identificación y estado visual en el legado

- Ruta declarada: **/adm/comercial/tarifas**; plantilla **templates/tarifas.edu.php**.
- Configuración en **configs/modules.edu.php**, estructura comercial > submenues > tarifas, interpretada de la serialización PHP sin ejecutar código.
- Tipo: **page**. Tabla: **TARIFAS**. Clave lógica designada por el código: **TARIFA**. Etiqueta: **Tarifas**.
- Roles directos del módulo: **ADMINISTRADOR, APROBADOR, COMERCIAL** (con duplicados en el arreglo histórico); roles2 menciona **CUSTOMER**. **index.php L617–647** verifica roles para abrir la pantalla, pero la barra lateral utiliza roles y roles2 de forma desigual y las APIs no repiten la comprobación de perfil específico.
- **templates/inc/sidebar.edu.php L87–92:** para el ramo de UI cuyo hostname no coincide con la variante especial, lista **tarifas** junto a **tarifario, tarifa_minima y otros** como elementos **deprecados**, representados visualmente tachados. La segunda rama de renderizado (L107–149) no replica esa marca visual. **No afirmar que el menú está funcionalmente deshabilitado:** existe plantilla, URLs, SQL y consumidores.
- **index.php L506–520** enruta /api/<nombre> a un archivo PHP si existe; L617–647 autoriza la página HTML del submenú por roles.
- **templates/tarifas.edu.php L1–11:** toma de los módulos el nombre, columnas y tabla. L96–97 incluye topbar/sidebar. Es una pantalla genérica de CRUD con DataTables.

## 2. Componentes activos revisados y trazabilidad

| Archivo del ZIP | Líneas | SHA-256 (prefijo) | Responsabilidad |
|---|---:|---|---|
| configs/modules.edu.php | 1 | 6f0586130715 | Tabla, clave, 7 campos, opciones y roles |
| index.php | 714 | f607993a5265 | Enrutamiento, sesión y tareas transversales |
| templates/inc/sidebar.edu.php | 167 | 7b3b2a97ff66 | Presentación condicional y marca de deprecado |
| templates/tarifas.edu.php | 388 | 6c1ce2a46b81 | Pantalla, formulario, DataTables, AJAX |
| api/getList.edu.php | 88 | be0828f1000b | Listado, búsqueda, orden y paginación |
| api/getListRowData.edu.php | 85 | f46a97357348 | Lectura de fila para edición |
| api/getListSendData.edu.php | 92 | 2b81940e8b18 | Alta, edición y refresco de cache |
| api/getListDeleteData.edu.php | 54 | aa4c61b3e47e | Borrado físico y refresco de cache |
| classes/functions.edu.php | 56 | 62104c47de50 | posts(), response(), _include() |
| classes/mssql.edu.php | 213 | 9d9acf1f84ea | ExecuteReader / ExecuteNonQuery / auditoria |
| templates/tarifario.edu.php | 1126 | 2f03a35e0715 | Consumidor de cache en menú Cliente Tasa |
| templates/limpiarcache.edu.php | 184 | d33a0cdd17e2 | Regeneración manual del catálogo |
| templates/articulos.edu.php | 665 | 769fa3fbd39e | Otro consumidor histórico de cache |
| api/getTarifas.edu.php | 95 | 29c0ee0ed3a6 | Consumidor de TARIFAS para tarifas por cliente |

Las referencias lineales son de los archivos extraídos **sin modificación** del ZIP indicado. Otras APIs consumidoras se citan por ruta y línea en la sección 7; éstas no se han homologado en esta ficha.

## 3. Campos y reglas declaradas — diccionario del menú

La matriz de columnas de modules.edu.php declara los siete campos como **visibles en lista y editables en formulario**, excepto que la plantilla hace **readonly** el input de clave primaria (L168–174). En el alta la clave también aparece en el formulario pero el backend la omite al construir INSERT.

| Tabla.columna | UI / control | Regla observada | Tipo SQL / nulabilidad / default / PK real |
|---|---|---|---|
| TARIFAS.TARIFA | Input de texto, readonly en la plantilla, primera columna listada | Clave primaria **según configuración de app**; orden base y RowId | **PENDIENTE: no hay CREATE TABLE de TARIFAS en los 20 .sql** |
| TARIFAS.DESCRIPCION | Texto | Nombre/descripcion, usado por búsquedas y autocompletado | PENDIENTE |
| TARIFAS.VALOR | Texto libre | Valor asociado a la tarifa, leído por consultas históricas; unidad/fórmula no constatadas | PENDIENTE |
| TARIFAS.[CIF/BOX] | Select | Opciones **C = CIF; F = FOB; B = BOX RATE; M = Mercaderia; V = Vehículo** | PENDIENTE |
| TARIFAS.OPERACION | Select | Opciones **%, B, V, K**; semántica y fórmulas no documentadas en el CRUD | PENDIENTE |
| TARIFAS.INICIAL | Texto libre | Columna catalogada, usada por informes y consultas históricas | PENDIENTE |
| TARIFAS.FINAL | Texto libre | Columna catalogada, usada por informes y consultas históricas | PENDIENTE |

**No inventar** el tipo, longitud, escala decimal, obligatoriedad, unicidad real, identity, FKs ni restricciones CHECK. **El “primary_key” es sólo un metadato de la aplicación**, no evidencia de PK declarada en SQL Server. **No hay filtro de empresa/puerto en el SELECT de este menú**, pero tampoco se confirma alcance multiempresa con la sola lectura.

## 4. Flujo completo de UI -> API -> SQL -> respuesta

| Paso / UI | Evidencia fuente | API y método | Operación real |
|---|---|---|---|
| Abrir pantalla | templates/tarifas L1–12, L96–127, L217–247 | POST /api/getList | DataTables serverSide: SELECT COUNT y SELECT de TARIFAS, búsqueda, orden, paginación |
| Buscar por Enter | L249–254 | POST /api/getList | Aplica OR LIKE sobre columnas consideradas buscables; sin búsqueda incremental por cada tecla |
| Abrir **Agregar** | L106, L128–186, L256–301 | No consulta hasta enviar | Modal con siete controles; CIF/BOX y OPERACION son select; input TARIFA readonly |
| Abrir **Editar** | L256–299 | POST /api/getListRowData | SELECT de campos de TARIFAS por clave TARIFA; carga formulario por JSON |
| Confirmar alta | L346–383 | POST /api/getListSendData, type diferente de “Editar” | INSERT en TARIFAS excluyendo la clave primaria; respuesta éxito/error y refresco de cache |
| Confirmar edición | L346–383 | POST /api/getListSendData, type “Editar” | UPDATE TARIFAS por TARIFA, omite asignación de la clave, refresco de cache |
| Confirmar eliminación | L304–344 | POST /api/getListDeleteData | DELETE FROM TARIFAS por TARIFA, sin soft delete; refresco de cache |
| Redibujar listado | L329–330 y L373–376 | POST /api/getList | Respuesta DataTables con RowId “row_” + TARIFA |
| Carga a otro catálogo | getListSendData L55–65, getListDeleteData L21–31 | no HTTP propia | SELECT * FROM TARIFAS ORDER BY TARIFA; reescribe archivo cache/tarifas |

**No hay en esta tela:** cotizaciones por cliente, vigencia FecVcto, moneda, gerencia/aprobación, estados APROBADO/PROVISORIO/ELIMINADO, alta de artículos, integración HTTP externa ni envío de correo desde sus cuatro APIs directas. Estos procesos se hallan en **otros menús y servicios**; mezclarlos produciría un mapeo incorrecto.

### 4.1 api/getList.edu.php
- L5–37 elige tabla y columnas por actual_url del POST contra módulos serializados; para este menu selecciona los siete campos.
- L39–40: COUNT total de TARIFAS.
- L41–68: construye dinámicamente filtros LIKE desde search.value y data de columnas enviados por el cliente; ordenamiento con order[column] y dir.
- L63–74: SQL Server usa SELECT TOP(length) externo con ROW_NUMBER() por TARIFA y RowNum > start; orden externo solicitado. Estabilidad de páginas ante orden distinto/duplicados exige comprobación.
- L80–87: convierte cada fila en respuesta JSON DataTables con DT_RowId = row_<TARIFA>.
- **No hay límite server-side visible** a tamaño de página, búsqueda, direcciones de orden o nombres de columnas.

### 4.2 api/getListRowData.edu.php
- L4–12 resuelve módulo desde actual_url; existe un desvío específico para segmentos (L6–37), **no relacionado con Tarifas**.
- L47–76: SELECT de columnas del formulario por primary_key = id de la fila, removiendo “row_”. L78–84 siempre asigna cod=00 y accede data[0], sin verificar si se encontró registro.
- La lectura no valida explícitamente que usuario pueda modificar TARIFAS.

### 4.3 api/getListSendData.edu.php
- L4–12 interpreta columnas y actual_url del POST; L14–41 arma columnas/valores de forma dinámica a partir del JSON del navegador.
- L17–39 excluye **siempre** la clave primary_key tanto en UPDATE como en INSERT. Para INSERT, el campo TARIFA que el usuario ve no se incluye (L25–39, L51–52). Determinar si la BD genera la clave; sin DDL no es posible afirmar que “Agregar” funciona.
- L45–53: UPDATE por TARIFA o INSERT con columnas restantes; strings se concatenan en SQL, no se hace binding parametrizado de los datos en esta API.
- L55–65: si db_table = TARIFAS, elimina/recrea cache/tarifas y carga todos los registros, **antes** de comprobar éxito de la alteración.
- L79–91: devuelve mensaje de operación según resultado de ExecuteNonQuery. No hay verificación de fila afectada ni de que el nuevo cache se creó correctamente.

### 4.4 api/getListDeleteData.edu.php
- L4–18: módulo/tabla/PK derivados del actual_url enviado por el navegador; SQL DELETE por TARIFA.
- L21–31: refuerzo del cache luego del DELETE, incluso si éste devolvió fallo.
- L45–53: éxito/error según retorno del adaptador; no hay bloqueo explícito de exclusión por referencias en TARIFA_CLIENTES ni registro de un motivo de borrado.

## 5. Operaciones SQL realmente identificadas

| Objeto | Columnas | Tipo R/I/U/D | Dónde y para qué |
|---|---|---|---|
| TARIFAS | TARIFA | R/I*/U/D | PK lógica, búsqueda, orden, WHERE; I* depende de generación por BD pues API omite clave |
| TARIFAS | DESCRIPCION, VALOR, [CIF/BOX], OPERACION, INICIAL, FINAL | R/I/U | Listado, ficha y datos en INSERT/UPDATE |
| TARIFAS | Todas (*) | R | SELECT cache al guardar/eliminar y “Limpiar caché” |
| sys_auditoria | fecha_hora, tabla, accion, datos_anteriores, usuario, usuario_session, query_log | I indirecta | classes/mssql.edu.php L163–185, invocado por ExecuteNonQuery L48–50 para INSERT/UPDATE/DELETE. No se verificó el DDL ni retención |

**Objetos SQL escritos directamente por el menú:** TARIFAS. **Objeto indirecto de auditoría SQL:** sys_auditoria. **Efecto no SQL:** archivo cache/tarifas en el servidor PHP. Las tareas transversales de index.php tienen otras tablas y están descritas en F00-002, no corresponden al CRUD específico de Tarifas.

**DDL:** inspección estática de los **20 archivos .sql** bajo SCRIPTS-BBDD: se encontraron consultas históricas a TARIFAS (por ejemplo SQLQuery5/6/8/9.sql), pero **ningún CREATE TABLE TARIFAS** que permita corroborar schema, índices y constraints. Archivos .bak no se restauraron ni inspeccionaron como base de datos. No hubo consulta a DB1.

### Auditoría técnica del driver
- **classes/mssql.edu.php L13–55** crea y cierra conexión por ExecuteNonQuery; L48–50 invoca auditoria() para SQL DML.
- Devuelve **1** para cualquier sentencia exitosa sin SCOPE_IDENTITY, sin usar filas afectadas (L41–54): una edición/borrado que no afecta filas puede informar éxito. La auditoría guarda query_log y sesión, pero **datos_anteriores** se entrega vacío desde el helper (L17–29, L163–185): no equivale a historial de valores anterior/posterior completo.
- Si la inserción en sys_auditoria falla, auditoria() registra error y retorna, **no provoca rollback** explícito de la operación anterior. No equiparar log del driver con integridad transaccional.
- Los valores de queries en el adapter son strings; algunos otros endpoints usan marcadores históricos, pero los cuatro CRUD de esta ficha generan SQL interpolado. No extrapolar seguridad de consultas nuevas de Agenda V2 a estos endpoints antiguos.

## 6. Dependencias y coexistencia de dos modelos comerciales

### 6.1 Modelo antiguo — código que usa TARIFAS y TARIFA_CLIENTES
- **Comercial > Cliente Tasa:** templates/tarifario.edu.php L410–415 usa cache/tarifas para autocompletar; L503 y L979 llaman **getTarifas** y **getTarifasSendData** (NO son APIs de este menú).
- **api/getTarifas.edu.php L5–6**, getTarifasAprobadas.edu.php, getTarifasParaAprobar.edu.php, getTarifasAVencer.edu.php, getTarifasEliminadas.edu.php: JOIN entre TARIFA_CLIENTES, TARIFAS, TARIFA_MINIMA, CLIENTES y TARIFA_CLIENTES_ESTADO.
- **api/getGrupoClientes.edu.php L22–25:** usa tabla TARIFAS y el vínculo por TARIFA.
- **api/getReporteRccne.edu.php L35/82:** reporte clientes con negociación especial une tarifa cliente y TARIFAS.
- **api/getTarifasSendData.edu.php L89/103:** lee la descripción del catálogo para mensajes de alta/actualización **de TARIFAS DEL CLIENTE**. Ese archivo pertenece al flujo Cliente Tasa, y contiene configuración de correo sensible: NO subirlo en bruto a un repositorio público.
- **templates/limpiarcache.edu.php L22–30:** regenera catálogo de TARIFAS.
- **templates/articulos.edu.php L345–346:** consume cache/tarifas.
- **index.php L346–360** incluye un antiguo bloque de regeneración horaria cache/tarifas, pero en la versión entregada está **COMENTADO**. No atribuirlo al procesamiento activo.

### 6.2 Modelo más reciente — tarifa por artículo/servicio
- En **api/getFacturacionCliente.edu.php L54–59 y L115–120**, las búsquedas SQL Server de tarifas vigentes consultan TARIFA_CLIENTES_ARTICULOS, TARIFA_CLIENTES_ARTICULOS_ESTADO y ARTICULO; varias consultas antiguas a TARIFAS están **comentadas** (L39–53, L65–81, L99–113).
- **api/getFacturacionClienteTarifasGrupo.edu.php L100–156:** para SQL Server utiliza TARIFA_CLIENTES_ARTICULOS, ARTICULO, segmentos y códigos de puerto; conserva una rama alternativa del catálogo TARIFAS cuando DB_TYPE = mysqli (L75–99).
- **api/getReporteTarifario.edu.php L35–59:** imprime tarifas por ARTICULO, CLIENTES, SEGMENTOS y TARIFA_CLIENTES_ARTICULOS, NO por TARIFAS.
- **Agenda Comercial V2 (LEG-MEN-001):** cotizaciones y tarifa por ARTICULO, con aprobación de cotización distinta de aprobación final de tarifa.

**Conclusión documental, NO decisión de implementación:** el menú TARIFAS está **visualmente tachado en un ramo de la sidebar** y convive con el modelo de ARTICULO. Ambos modelos, incluidas sus variantes históricas, deben inventariarse y preservarse como evidencia. **No inferir que TARIFAS está inactiva, que puede eliminarse ni que debe reproducirse tal cual en V2.** F00 documenta; F01 comparará con los 50 RF y prototipo; F02/F03 proyectarán el sistema nuevo tras aprobación.

## 7. Hallazgos, gravedad e impacto

| ID | Riesgo de diseño | Evidencia | Estado / efecto |
|---|---|---|---|
| TAR-01 | **Alta — API genérica carece de autorización de operación específica** | index.php L506–520 incluye cualquier API existente; getListSendData/getListDeleteData no verifican rol ni titularidad | OBSERVADO. Evaluar autorización efectiva de sesión/router; no afirmar explotación |
| TAR-02 | **Alta — SQL dinámico controlado por el navegador** | getList L41–74: búsquedas, nombre de columnas, order, TOP, start concatenados; getListSendData L14–53: claves de JSON se usan como nombres de columnas | OBSERVADO. Riesgo de inyección y acceso no previsto, sin prueba de ataque |
| TAR-03 | **Alta — borrado físico y referencias entre catálogos** | getListDeleteData L13–19; consumidores TARIFA_CLIENTES unidos por TARIFA | OBSERVADO. Podría fallar por FK o dejar referencias huérfanas si no hay FK; DDL pendiente |
| TAR-04 | **Alta — incoherencia entre clave visible y INSERT** | config primary_key=TARIFA; UI L168–174 readonly; getListSendData L25–39 excluye primary_key del INSERT | OBSERVADO. Si TARIFA no es autogenerada, alta fallará; confirmar schema |
| TAR-05 | **Alta — no hay validación de negocio del lado servidor** | getListSendData L4–53 acepta textos y campos del JSON, sin enums/numéricos/rango/obligatoriedad | OBSERVADO. Campos VALOR, OPERACION, CIF/BOX, INICIAL/FINAL requieren contrato futuro |
| TAR-06 | **Media/alta — sin token CSRF visible en APIs de alta, edición y borrado** | templates/tarifas L304–383, APIs getListSendData/getListDeleteData | OBSERVADO en estos archivos; verificar políticas globales no visibles antes de homologar |
| TAR-07 | **Media/alta — cache no transaccional** | getListSendData L55–65, getListDeleteData L21–31: unlink, SELECT *, fopen, fwrite, fclose | OBSERVADO. Podría quedar cache ausente/parcial/desactualizado ante error, concurrencia o permisos |
| TAR-08 | **Media — serialización de cache se concatena manualmente en JavaScript** | getListSendData L58–62; tarifario L410–415 | OBSERVADO. Escapar comillas no cubre todos los caracteres JSON/JS; se requiere codificación segura |
| TAR-09 | **Media — éxito de DML no confirma fila afectada** | classes/mssql L41–54 devuelve 1 sin sqlsrv_rows_affected | OBSERVADO. DELETE/UPDATE inexistente puede exhibir “success” |
| TAR-10 | **Media — historial SQL incompleto y fallo silencioso de auditoría** | classes/mssql L17–29 y L163–185 | OBSERVADO. Registra SQL/sesión, pero no valores anteriores ni rollback por auditoría fallida |
| TAR-11 | **Media — caché con rutas de instalación mixtas** | getListSendData L55–62; getListDeleteData L21–28: path absoluto /terport para borrar, SITE_PATH para escribir | OBSERVADO. En despliegues con ruta diferente pueden quedar archivos duplicados |
| TAR-12 | **Media — orden/paginación sin límites robustos** | getList L39–75 y template L218–254 | OBSERVADO. No hay límite server-side ni orden secundario estable para claves no únicas |
| TAR-13 | **Media — UX sin manejo de fallos de red** | templates/tarifas L278–301, L320–342, L363–382 | OBSERVADO. AJAX sólo declara callback success; botones pueden quedar deshabilitados al fallar conexión |
| TAR-14 | **Alta — coexistencia de catálogos de tarifas antiguos y nuevos** | sidebar L87–92, getFacturacionCliente L54–59, getFacturacionClienteTarifasGrupo L100–156 | OBSERVADO. Requiere un mapa de equivalencias y decisión de qué flujo es fuente de verdad |
| TAR-15 | **Pendiente crítico de esquema** | 20 scripts SQL en ZIP sin CREATE TABLE TARIFAS; no metadatos vivos de DB1 | PENDIENTE. No se verifican PK/FK, tipos, duplicidad, reglas CHECK, índices ni precisión |
| TAR-16 | **Media — posible diferencia entre rol del menú y acceso de API** | config roles/roles2, sidebar L43–46/L82–97, index L617–647 | OBSERVADO. CUSTOMER mencionado en roles2 no implica permiso confirmado de entrada |

**No hay evidencia de acciones directas de correo, alerta de vencimiento, cálculo fiscal o aprobación en el CRUD maestro TARIFAS.** Las aprobaciones y los correos asociados a tarifas de cliente pertenecen a otros módulos. **No reproducir ni publicar las credenciales embebidas** detectadas en archivos de otros flujos; tratarlas en revisión de seguridad por separado.

## 8. Modelo de uso y criterios de preservación

1. **Catálogo maestro:** cada registro TARIFAS se define por clave TARIFA y seis atributos adicionales; no se detectó vigencia ni precio por cliente en ese maestro.
2. **Vínculo histórico:** TARIFA_CLIENTES.TARIFA → TARIFAS.TARIFA en consultas; debe examinarse si ese vínculo sigue requerido en DB1.
3. **Tipos de cálculo:** código de operación y modalidad CIF/BOX están declarados, pero el CRUD no define fórmulas ni validaciones server-side; no adjudicar significado contable a %, B, V o K sin rastrear consumidores.
4. **Dependencias de cache:** interfaz cliente usa autocompletado desde cache/tarifas; cambios de catálogo afectan UI sin pasar por nueva API de lectura dinámica.
5. **Nuevos flujos:** TARIFA_CLIENTES_ARTICULOS vincula clientes y ARTICULO/segmentos/puerto, y alimenta reporte de tarifas más reciente; no reducirlo al maestro TARIFAS.
6. **Aprobaciones:** estado APROBADO/PROVISORIO/ELIMINADO en tarifas por cliente es diferente de insertar/editar/borrar master TARIFAS.
7. **Rastreo de autorización:** preservar reglas reales que afectan facturación/aprobaciones, aunque el usuario decidió rediseñar la administración de usuarios desde cero.
8. **Separación F00/F01/F02:** F00 registra cómo funciona el PHP; F01 decidirá equivalencias y brechas versus prototipo/RF; F02 propondrá nuevo SQL Server desde cero, sin ejecutar migración.

## 9. Cobertura real, incertidumbres y aceptación

**Cobertura estática realizada:**
- Ruta y roles declarados: sí.
- 7 campos declarados y opciones de formularios: sí.
- DataTables, altas, ediciones, lectura, borrado y UX: sí.
- Cuatro APIs efectivamente invocadas por la pantalla: sí, inspección completa.
- SQL directo y efecto de auditoría SQL: sí.
- Cache, consumidores y coexistencia con nuevo modelo por artículo: sí, trazado de archivos relevantes.
- 20 scripts SQL existentes en ZIP: revisados para localizar CREATE TABLE TARIFAS; **no encontrado**.
- Efectos transversales del router: referencia a F00-002, sin repetir una auditoría completa de esos procesos.
- Versiones **.bak/.orig** y otras variantes: **AÚN NO INVENTARIADAS NI COMPARADAS COMPLETAMENTE**; preservarlas como evidencia histórica e identificar qué funcionalidades/reglas difieren, aunque no se demuestre uso actual. No marcarlas descartadas. Referencia: F00-004 política de preservación.

**No realizado / no comprobable por estos archivos:**
- Confronto de DB1 activa con el ZIP, estructura completa de TARIFAS, PK/FK/índices, constraints, valores permitidos, auditoría histórica y frecuencia de uso.
- Prueba de navegación por perfiles, permisos de APIs, consistencia de registros, consultas reales o concurrencia.
- Ejecución de PHP/SQL o pruebas destructivas; aprobación del responsable.
- Alcance completo de Cliente Tasa, aprobación de tarifas del cliente, facturación y nuevo modelo ARTICULO: estas funcionalidades quedan **identificadas como dependencias**, no auditadas al 100% en esta ficha.

**Condición para VALIDADO:** revisar esta ficha con el responsable, confirmar qué modelo es fuente de verdad y qué funciones antiguas siguen activas, obtener DDL/metadatos actuales y registrar decisiones expresas. **Estado actual: DOCUMENTADO ESTÁTICAMENTE / VALIDACIÓN PENDIENTE.**

**Sin orden a Claude, sin modificación de aplicación, sin SQL, sin deploy y sin merge.**

## 10. Corrección explícita del objetivo del proyecto — 23/11/2026

**Por decisión del responsable:** las fichas F00 analizan y documentan el legado completo y sus versiones anteriores. **No se trata de reproducir el PHP antiguo**, ni de excluir funciones por parecer deprecadas. La ficha LEG-MEN-003 cubre inicialmente el archivo activo en el ZIP, pero todavía requiere comparar variantes .bak/.orig, cambios entre releases y consumidores antiguos antes de cerrar el inventario histórico. Después de F00, **los 50 requisitos RF-01…RF-50 de Linear** y el prototipo aceptado serán confrontados con todas las funciones registradas; sólo entonces se diseñará **un sistema nuevo** en F02/F03. Ninguna decisión de mantener, modificar o eliminar se da por tomada aquí.

Política: [F00-004 — Preservação de versões e conhecimento legado](F00-004-PRESERVACAO-VERSOES-REGRAS-REQUISITOS-R01.md).
