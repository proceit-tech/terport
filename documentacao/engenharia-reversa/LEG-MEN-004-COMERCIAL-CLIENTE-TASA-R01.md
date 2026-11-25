# TERPORT — LEG-MEN-004 · Comercial > Cliente Tasa — auditoría PHP/SQL F00/R01

**Fecha de revisión:** 25/11/2026. **Estado:** DOCUMENTADO mediante lectura estática de la versión de archivos incluida en el ZIP; **NO VALIDADO EN SERVIDOR NI APROBADO**.  
**Fuente conservada:** `terport.zip` y `terport(1).zip`, idénticos, SHA-256 `3e89b3e3d92549ff38990cc8296075ad3eb7788553fb5641246fc2eb6fd506a6`.  
**Ubicación de auditoría:** `proceit-tech/terport`, PR #2 en Draft. Se registran pruebas por **archivo y líneas**, nunca contenidos sensibles del cliente.  
**Prohibido en F00:** ejecutar PHP/SQL/tests, modificar `terportV2`, iniciar Claude, hacer merge o decidir qué partes se reproducirán en el sistema nuevo.

## 1. Alcance exacto: existen dos entradas distintas

| Menú declarado en `configs/modules.edu.php` | Plantilla del ZIP | Base principal | Estado de esta ficha |
|---|---|---|---|
| **Comercial > Cliente Tasa** (clave `tarifario`) | `templates/tarifario.edu.php` | `TARIFA_CLIENTES` | **ESTA AUDITORÍA, LEG-MEN-004** |
| **Comercial > Cliente Tasas** (clave `cliente_tasa`) | `templates/cliente_tasa.edu.php` | `TARIFA_CLIENTES_ARTICULOS` | Menú diferente; documentado como dependencia, **NO HOMOLOGADO por esta ficha** |

No fusionar ambos. `Cliente Tasa` corresponde al Tarifario antiguo, no al mantenimiento moderno por `ARTICULO`. `templates/tarifario.edu.php` presenta encabezado **“Tarifario”** (L137). La ruta declarada es **`/adm/comercial/tarifario`**. La entrada figura entre los ítems visualmente tachados/deprecados en **una rama** de `templates/inc/sidebar.edu.php` (L87–92); el otro renderizado no aplica necesariamente esa marca. **No implica ausencia de funcionalidad ni autoriza eliminar reglas**.

`configs/modules.edu.php` registra `db_table=TARIFA_CLIENTES`, `type=page`, y roles `ADMINISTRADOR`, `APROBADOR`, `COMERCIAL` (duplicados en datos serializados), con `roles2` `CUSTOMER`, `TRANSPORTES`. La visibilidad y el acceso realmente aplicados dependen de `index.php` y `sidebar.edu.php`; **no se ha probado** la combinación de cada perfil.

## 2. Archivos directamente revisados (fuente del ZIP)

| Archivo original | Líneas | Evidencia y cometido |
|---|---:|---|
| `configs/modules.edu.php` | serializado | Ruta, módulo, roles y 12 columnas editables |
| `templates/tarifario.edu.php` | **1.126** | Listado, detalle, formularios, autocompletado, servicios y AJAX |
| `api/getTarifas.edu.php` | 95 | Listado con DataTables, estados y grupos de clientes |
| `api/getTarifasRowData.edu.php` | 50 | Recuperación de la tarifa del cliente por identificadores |
| `api/getTarifasSendData.edu.php` | 144 | Alta, edición, estado PROVISORIO y comunicación a aprobadores |
| `api/getTarifasDelete.edu.php` | 21 | **Exclusión lógica** por estado ELIMINADO |
| `api/getTarifasArticulos.edu.php` | 26 | Artículos/servicios en listas del cliente |
| `api/getTarifasArticulosAgregar.edu.php` | 24 | Alta de artículos/servicios en LISTAS |
| `api/getTarifasArticulosDelete.edu.php` | 19 | **DELETE físico** de línea en LISTAS |
| `classes/mssql.edu.php` | 213 | Adaptador SQLSRV y auditoría genérica de DML |
| `index.php`; `templates/inc/sidebar.edu.php` | 714 / 167 | Router, sesión y políticas de navegación |

**Siete endpoints de API directos**, todos llamados por POST en la plantilla del Tarifario: `getTarifas`, `getTarifasRowData`, `getTarifasSendData`, `getTarifasDelete`, `getTarifasArticulos`, `getTarifasArticulosAgregar`, `getTarifasArticulosDelete`. Se revisaron además las referencias de aprobación, habilitación, vencimiento, facturación y reportes **como dependencias**, sin declarar completos esos otros menús.

## 3. Funciones y pantalla — trazabilidad UI → API

| Control/acción | Evidencia UI | Endpoint | Resultado observado |
|---|---|---|---|
| Listado Tarifario | L137–156 y L498–526 | `getTarifas` | Cliente, razón social, concepto %, tasa mínima/unidad, estado; DataTables serverSide |
| Búsqueda por Enter | L529–534 | `getTarifas` | Filtro textual en SQL de cliente, descripciones, estado |
| Expandir registro | L539–574; L877–882 | Sin llamada propia | Valor, importe mínimo, estadía, moneda, energías, operación, inicial/final, vencimiento, compartir, grupos; botones Editar/Copiar/Eliminar |
| Agregar | L140 y L718–735 | `getTarifasSendData` | Alta con clave cliente/tarifa/tasa mínima, importe, moneda, operación y otros atributos |
| Editar | L576–669 | `getTarifasRowData`; `getTarifasArticulos` | Recarga datos de tarifa, bloquea cambio de identificadores, muestra servicios del cliente |
| Copiar | L672–717 | `getTarifasRowData` | Carga una tarifa existente como base para nueva asignación. No aplica alta hasta Enviar |
| Guardar | L920–1002 | `getTarifasSendData` | Valida cliente/tarifa/tasa mínima no vacíos; normaliza importe, vencimiento y bandera GRUPO antes de POST |
| Eliminar tarifa cliente | L885–918 | `getTarifasDelete` | Solicita confirmación, marca estado ELIMINADO; NO borra TARIFA_CLIENTES |
| Ver servicios | L266–327, L646–663 | `getTarifasArticulos` | Lista ARTICULO, LISTA, INCLUYEIMP y PRECIO asociados al cliente |
| Agregar servicio | L1064–1121 | `getTarifasArticulosAgregar` | Inserta LISTAS para cliente, artículo, lista, moneda, impuesto y precio |
| Borrar servicio | L1005–1062 | `getTarifasArticulosDelete` | Borrado físico de LISTAS por cliente + artículo + lista, con confirmación |

**Alcance funcional importante:** en `getTarifasArticulos.edu.php` L4–9 la consulta filtra sólo por **`LISTAS.CLIENTE`**, no por `TARIFA` o `TASAMINIMO`. Por ello los servicios asociados se visualizan como un conjunto por cliente, incluso desde la edición de una tarifa específica; preservar este hecho sin suponer que son líneas hijas exclusivas de la tarifa.

## 4. Catálogos, campos y validaciones exactas

La matriz serializada del módulo `tarifario` define **12 campos de formulario**:

| Campo `TARIFA_CLIENTES` | UI y regla observadas | Evidencia |
|---|---|---|
| `CLIENTE` | Identificador de cliente; typeahead desde `cache/clientes`, permite búsqueda por número/razón social | plantilla L169–175 y L384–390, L738–765 |
| `TARIFA` | Código de Tasa %; typeahead desde `cache/tarifas` | L185–193, L410–415, L769–797 |
| `TASAMINIMO` | Código de tasa mínima/unidad/medida; typeahead desde `cache/tasaminimo` | L197–206, L436–441, L800–827 |
| `GRUPO` | “COMPARTIR?” checkbox, se envía como bandera desde JS | L177–180 y L976 |
| `IMPORTEMINIMO` | Importe mínimo; convierte coma a punto antes de enviar | L211–214 y L933–935 |
| `ESTADIA` | Estadía libre; texto del formulario, sin validación server-side específica constatada | L215–217 |
| `MONEDA` | **L = LOCAL; E = EXTRANJERA** | L219–225 |
| `IE` | **I = IMPORTACION FCL; E = EXPORTACION; L = IMPORTACION LCL; T = IMPORTACION TERRESTRE** | L230–237 |
| `ENERGIAG` | “PRECIO ENERGIA” | L239–241 |
| `ENERGIA` | “ENERGIA LIBRE” | L243–245 |
| `FecVcto` | Fecha de vencimiento, entrada texto; JS reconoce `.`, `-` y `/`; si vacía, coloca **31/12 del año actual** | L251–254 y L937–967 |
| `OBSERVACION` | Texto de observación, sin validación material adicional identificada | L255–258 |

La selección de un código en typeahead muestra su descripción, pero las reglas de compatibilidad entre tasa, mínimo, cliente y moneda **no están especificadas en esta pantalla**. Se requiere revisar otras versiones y los catálogos completos. La validación de Enviar (L920–999) exige sólo **CLIENTE, TARIFA y TASAMINIMO no vacíos**; no constituye contrato integral de validación de los otros campos.

### Submódulo Servicios (`LISTAS`)
- La lista de artículos usa `cache/articulos` y la lista de precios `cache/listas` (plantilla L462–475, L831–874).
- Formulario: `ARTICULO`, `LISTA`, `PRECIO`; la tabla muestra también `INCLUYEIMP` y moneda implícita (L281–324).
- `getTarifasArticulosAgregar.edu.php` L4–13: si `LISTA='01'`, asigna `MONEDA='L'`; para las demás listas usa `MONEDA='E'`. `INCLUYEIMP='S'` fijo en el INSERT. **No inferir que todas las listas distintas de 01 son legítimamente moneda extranjera sin revisar catálogo**.
- `getTarifasArticulos.edu.php` L17 formatea lista 01 como “PRECIO GS” (entero) y otras como “PRECIO U$” (2 decimales). Formato visual **no prueba unidad ni precisión física SQL**.

## 5. Flujo de datos y transiciones de estado

### 5.1 Listar (`getTarifas.edu.php`)
- L5–6: une `TARIFA_CLIENTES` con `CLIENTES`, `TARIFAS`, `TARIFA_MINIMA` y `TARIFA_CLIENTES_ESTADO`. El JOIN con estado incluye **CLIENTE + TARIFA + TASAMINIMO + IMPORTEMINIMO**.
- L8–55: `COUNT`, filtro `CLIENTES.FACTURABLE='S'`, búsqueda, ordenamiento y paginación DataTables; existen ramas `mysqli` y SQL Server con consultas diferentes.
- L61–92: construye `DT_RowId` con los cuatro valores clave y transforma la fecha de vencimiento: si ya pasó, el estado exhibido pasa a **VENCIDO**, sin UPDATE SQL; convierte GRUPO numérico a SI/NO y consulta los grupos asociados al cliente.
- La consulta auxiliar por cada fila (L78–87) une `CLIENTES_GRUPOS_DETALLES` con `CLIENTES_GRUPOS` para montar un HTML de grupos.

### 5.2 Alta / edición (`getTarifasSendData.edu.php`)
- L2–16: comprueba que la sesión contenga nombre de usuario, interpreta `columnas` y `actual_url` del cliente e identifica la tabla por configuración.
- L18–55: genera el SQL de `UPDATE` o `INSERT` con columnas y valores derivados de JSON enviado por navegador; transforma `FecVcto` a formato SQL en rama SQL Server. Los datos no están unidos mediante parámetros tipados por esa API.
- **Alta** (L71–75): inserta `TARIFA_CLIENTES` agregando `FECHACT`, `USUARIO` y `FECALTA`; si resulta exitoso, inserta un estado inicial **PROVISORIO** en `TARIFA_CLIENTES_ESTADO`.
- **Edición** (L59–70): hace UPDATE a la tarifa y luego, según existencia del estado, INSERT/UPDATE de **PROVISORIO**. Es una regla relevante: editar puede volver una tarifa previamente aprobada a provisional.
- Las operaciones SQL de tarifa y estado ocurren por llamadas separadas, sin transacción explícita en este archivo. `ExecuteNonQuery` es llamado secuencialmente y devuelve 1 por instrucción ejecutada correctamente, sin comprobar filas afectadas (driver L41–54); el código sobreescribe el resultado de la primera operación al grabar el estado. **Riesgo de inconsistencia y de reportar éxito parcial, sin fallo reproducido**.
- L78–138: ante éxito construye correo “Tarifa ACTUALIZADA”/“Tarifa NUEVA”, obtiene razón social y descripciones por SQL, consulta `SYS_USUARIO_APROBADOR` con `tipo='PERMANENTE'` y envía SMTP a los destinatarios encontrados. **Se detectaron credenciales SMTP embebidas en texto plano** en la versión activa y variantes; **no reproducir valores, usuarios de correo ni destinos sensibles en GitHub/Linear**. La emisión de correo ocurre después de las escrituras: un error de transporte no equivale a rollback de la tarifa.

### 5.3 Eliminar (`getTarifasDelete.edu.php`)
- L4–17: de `DT_RowId` obtiene **CLIENTE, TARIFA, TASAMINIMO e IMPORTEMINIMO** y realiza **UPDATE de `TARIFA_CLIENTES_ESTADO.estado='ELIMINADO'`**. No ejecuta DELETE sobre `TARIFA_CLIENTES`.
- Distinto: `getTarifasArticulosDelete.edu.php` L4–14 **sí hace DELETE físico de LISTAS**.

### 5.4 Transiciones en otros menús (dependencias, no partes de la pantalla)
- `getTarifasParaAprobarAprobar.edu.php` L18–20: actualiza estado a **APROBADO** (composite de cuatro partes) desde la lista “Tarifas para aprobar”.
- `getTarifasEliminadasHabilitar.edu.php` L7–9: cambia estado a **APROBADO** para habilitar una tarifa eliminada.
- `getTarifasEliminadasEliminar.edu.php` L7–9: ejecuta **DELETE físico en TARIFA_CLIENTES** en un menú de eliminadas; **no confundirlo con “Eliminar” de Cliente Tasa**.
- `getTarifasAVencerExtender.edu.php` L7–9: modifica `TARIFA_CLIENTES.FecVcto` agregando meses a partir de fecha actual, no a partir de la fecha anterior; el WHERE identifica sólo CLIENTE + TARIFA + TASAMINIMO en este archivo.
- `getTarifasParaAprobar.edu.php` L8: lista PENDIENTE/PROVISORIO vigentes; `getTarifasAprobadas.edu.php` L8 lista APROBADO vigente; `getTarifasEliminadas.edu.php` L8 muestra ELIMINADO; `getTarifasAVencer.edu.php` L8 usa `DATEDIFF(month, GETDATE(), FecVcto) <= 1` (mes calendario, **no exactamente 30 días**).

**Estados observados:** PENDIENTE, PROVISORIO, APROBADO, ELIMINADO; **VENCIDO** es estado derivado para presentación por comparación de fechas. Esta lectura no confirma la existencia de tabla formal de transiciones ni autorizaciones completas para cada operación.

## 6. Inventario SQL de campos, lecturas y escrituras

**12 objetos SQL distintos nombrados por las siete APIs, sus referencias visibles y el adaptador transversal de auditoría**. La columna tipo/PK/FK indica **pendiente** cuando no hay DDL completo verificado; el nombre de un campo en código **no prueba su tipo ni integridad física**.

| Objeto SQL | Columnas observadas | Operaciones y origen |
|---|---|---|
| `TARIFA_CLIENTES` | CLIENTE, TARIFA, TASAMINIMO, IE, ESTADIA, OBSERVACION, IMPORTEMINIMO, MONEDA, ENERGIAG, ENERGIA, FecVcto, GRUPO, FECHACT, USUARIO, FECALTA | R/I/U; lista, consulta de fila, alta, edición; D físico **en otro menú** |
| `TARIFA_CLIENTES_ESTADO` | CLIENTE, TARIFA, TASAMINIMO, IMPORTEMINIMO, estado | R/I/U; transición PROVISORIO/ELIMINADO en menú; APROBADO en otras rutas |
| `CLIENTES` | NUMERO, RAZONSOC, FACTURABLE | R; listado, descripciones, JOIN con LISTAS |
| `TARIFAS` | TARIFA, DESCRIPCION, VALOR, OPERACION, INICIAL, FINAL | R; conceptos por cliente; moneda/operación del catálogo se consume como descripción |
| `TARIFA_MINIMA` | TASAMINIMO, DESCRIPCION | R; concepto tasa mínima |
| `CLIENTES_GRUPOS_DETALLES` | cliente, cliente_grupo | R; grupos de cliente |
| `CLIENTES_GRUPOS` | id, descripcion | R; nombres de grupos |
| `LISTAS` | ARTICULO, CLIENTE, LISTA, INCLUYEIMP, MONEDA, PRECIO | R/I/D; servicios del cliente |
| `ARTICULO` | NUMERO, DESCRIP | R; descripción de servicio |
| `SYS_USUARIO_APROBADOR` | usuario, tipo | R; aprobadores permanentes para email |
| `SYS_USUARIO` | id, nombre, email | R; destinatarios y nombres |
| `sys_auditoria` | fecha_hora, tabla, accion, datos_anteriores, usuario, usuario_session, query_log | I indirecta desde `classes/mssql.edu.php` L163–185 para DML |

**Mapa de dependencias (sin validar FK físicas):**
- `TARIFA_CLIENTES.CLIENTE` → `CLIENTES.NUMERO` (JOIN).
- `TARIFA_CLIENTES.TARIFA` → `TARIFAS.TARIFA` (JOIN).
- `TARIFA_CLIENTES.TASAMINIMO` → `TARIFA_MINIMA.TASAMINIMO` (JOIN).
- `TARIFA_CLIENTES` → `TARIFA_CLIENTES_ESTADO` por el compuesto de **cuatro campos** en el código activo; versiones históricas de la API lo hacían por tres.
- `CLIENTES_GRUPOS_DETALLES.cliente` → `CLIENTES`; `cliente_grupo` → `CLIENTES_GRUPOS.id`.
- `LISTAS.CLIENTE` → `CLIENTES.NUMERO`; `LISTAS.ARTICULO` → `ARTICULO.NUMERO`.
- `SYS_USUARIO_APROBADOR.usuario` → `SYS_USUARIO.id` (JOIN).

No se halló definición completa `CREATE TABLE` de las **tablas legadas TARIFA_CLIENTES y TARIFA_CLIENTES_ESTADO** en los scripts de referencia entregados. Los scripts `SCRIPTS-BBDD/SQLQuery5.sql`, `SQLQuery6.sql`, `SQLQuery8.sql` contienen consultas comparativas, ALTER, UPDATE y DELETE históricos; `SCRIPTS-BBDD/1nov/SQLQuery6.sql` contiene CREATE TABLE del **modelo nuevo TARIFA_CLIENTES_ARTICULOS**, no de la tabla antigua. **No ejecutar scripts históricos como migración ni inferir esquema productivo a partir de ellos.** Los tipos, longitudes, nullable, PK/FK, UNIQUE, índices, defaults, collation y precisión monetaria requieren metadatos reales de DB1.

## 7. Versiones antiguas y diferencias históricas — NO perder

Se compararon los contenidos **byte a byte y por cambios de líneas** de las variantes incluidas en el ZIP. **La extensión .bak o el nombre del archivo no comprueba fecha ni orden cronológico de implantación**. Las dos copias ZIP son duplicados, no dos releases diferentes.

| Principal y variante en el ZIP | Diferencia preservada |
|---|---|
| `templates/tarifario.edu.php` vs `.bak` (ambos 1.126 líneas) | Cambios de nombres del selector I/E (p.ej. IMPORTACION vs IMPORTACION FCL/LCL/TERRESTRE) y selector JavaScript de fila al abrir edición; los códigos I/E/L/T se deben revisar con los formularios antiguos |
| `api/getTarifasRowData.edu.php` vs `.bak` (50 líneas) | La variante busca por **CLIENTE + TARIFA + TASAMINIMO**; archivo principal añade **IMPORTEMINIMO** al WHERE |
| `api/getTarifasDelete.edu.php` vs `.bak` (21 líneas) | Variante marca ELIMINADO por triple clave; archivo principal usa cuatro campos, con IMPORTEMINIMO |
| `api/getTarifasSendData.edu.php` vs `.bak` (144 frente a 140 líneas) | Variante antigua edita/busca estado por triple clave y crea estado sin IMPORTEMINIMO; principal incluye el cuarto campo en WHERE/INSERT y modifica configuración de envío de correo |
| `getTarifasSendData.edu.php.bak2`, `.bak3`, `.bak4` (140 líneas) | Diferencias concentradas en destinatarios, configuración de transporte y manejo de correo; algunas variantes alteran selección de destinatarios/condiciones; **no publicar credenciales ni direcciones** |
| `getTarifasSendData_NE.edu` (144 líneas) | Variante adicional con diferencias de configuración de envío de correo; extensión distinta de los endpoints `.edu.php`, por lo que **no se puede afirmar que fuera la ruta activa** |
| `templates/cliente_tasa.edu.vprod06012020.php` vs `cliente_tasa.edu.php` | **Otro menú**, “Cliente Tasas”, con 1.222 frente a 1.244 líneas; diferencias en formularios, controles y JavaScript. Preservar para auditoría específica del modelo por ARTICULO, no mezclar en LEG-MEN-004 |

**Diferencia principal de versiones:** la identidad funcional utilizada por APIs antiguas evolucionó de **tres a cuatro atributos al incluir IMPORTEMINIMO**. Es evidencia de cambio en **consultas y código**, **no prueba** que se modificó el PK físico de la BD. Debe reconciliarse con los metadatos y registros históricos sin modificar producción.

**Material histórico pendiente de recibir/validar:** otras releases completas, fechas de uso real, logs/versiones de producción, diccionario SQL autorizado de DB1. No se declara que el ZIP contenga todas las versiones nunca existentes.  
**Política general:** `F00-004-PRESERVACAO-VERSOES-REGRAS-REQUISITOS-R01.md`.

## 8. Hallazgos de ingeniería (sólo estáticos; no incidentes reproducidos)

| ID | Severidad estimada | Evidencia de código | Riesgo / validación requerida |
|---|---|---|---|
| CT-01 | Alta | RowData/Del/SendData y variantes .bak | Diferencia histórica entre clave lógica de 3 y 4 elementos; preservar correspondencia e identificar registros afectables |
| CT-02 | Alta | SendData L59–75 | INSERT/UPDATE en tarifa y estado en instrucciones separadas; fallo de segundo paso puede dejar modificación parcial, sin rollback visible |
| CT-03 | Alta | SendData L59–70 | Una edición asigna PROVISORIO aunque estuviera APROBADO; determinar flujo de reaprobación y permisos reales |
| CT-04 | Alta | SendData L2–16, L17–55 y otras APIs | Endpoint de alta depende de sesión nominal, pero no verifica rol/alcance operativo; JSON contiene nombres de campos/tabla derivados de datos de navegador |
| CT-05 | Alta | getTarifas L11–53 | Valores de búsqueda, orden/columna y paginación se concatenan en SQL; falta lista permitida estricta y binding visible |
| CT-06 | Alta | getTarifas L44 y L53 | En rama SQL Server, alias de subconsulta se construye usando cadena completa con JOINs; sintaxis/columnas externas parecen inconsistentes; **no se ha ejecutado ni probado** |
| CT-07 | Media/alta | getTarifas L41–55 | Ramas SQL Server vs mysqli muestran distintos filtros de expiración/estado en ausencia de búsqueda; confirmar comportamiento productivo |
| CT-08 | Media | getTarifas L61–88 | Expiración produce “VENCIDO” sólo en UI; grupo por cliente exige SELECT adicional **por cada fila**, con costo N+1 |
| CT-09 | Alta | getTarifasRowData L38–49 | SELECT usa ID compuesto interpretado por underscores; no valida existencia antes de acceder a data[0], ni autorización sobre el registro |
| CT-10 | Alta | getTarifasDelete L4–17 vs ArticulosDelete L4–14 | “Eliminar” tarifa es lógico, pero borrar servicio es DELETE físico; no confundir alcance del historial |
| CT-11 | Media/alta | Articulos L7–17, agregar L4–13 | Servicios LISTAS pertenecen al cliente, no a una tarifa; agregar asigna impuesto S y moneda por lista sin validar catálogo formal |
| CT-12 | Alta | SendData L111–133 | Credenciales de transporte SMTP embebidas en archivo PHP y variantes; requiere aislamiento/rotación planificados; **no reproducir secretos** |
| CT-13 | Alta | SendData L78–134 | Comunicación por correo después de guardar y consulta de aprobadores sin transacción/garantía de entrega; distinguir guardado de notificación |
| CT-14 | Media | tarifario L937–967 | Vencimiento vacío pasa a 31/12 del año de sesión; fecha puede no ser futura y no hay validación semántica completa |
| CT-15 | Alta | templates/tarifario L877–879; Articulos L17; lista L78–85 | Construcción de HTML desde datos SQL sin escape consistente; posible inyección de contenido si algún dato es no confiable |
| CT-16 | Alta | SendData L17–55; ArticulosAgregar/Delete | Interpolación de entradas de POST en SQL para escritura; sin consultas parametrizadas en esas APIs |
| CT-17 | Media | UI L920–999; endpoints | Validación de formulario incompleta para moneda, números, límites, duplicados, vencimiento y artículos; política completa no documentada |
| CT-18 | Media | mssql L41–54, L163–185 | `ExecuteNonQuery` reporta 1 por ejecución SQL sin comprobar filas afectadas; auditoría DML no asegura reversión o valores anteriores |
| CT-19 | Media | cache/clientes, tarifas, tasaminimo, articulos, listas | Autocompletados dependen de archivos cache separados; puede haber datos obsoletos o divergentes, sin garantía de consistencia |
| CT-20 | Pendiente | Scripts SQL del ZIP | DDL completo de entidades legadas no comprobado; no inventar tipos, PK/FK o fecha de cambios de versión |

**Ningún hallazgo anterior equivale a prueba de explotación, incidencia real en producción o resultado de test.** No se ejecutaron comandos de base ni se corrigió la aplicación.

## 9. Matriz de cobertura y decisiones diferidas

| Objeto/función histórica | Evidencia en LEG-MEN-004 | Estado F00 | F01/F02 posterior |
|---|---|---|---|
| Tarifario cliente original por TASA % y TASA MINIMA | plantilla + 7 APIs | OBSERVADO | Comparar con RF-01…RF-50 y prototipo |
| Tarifas compartidas (GRUPO) y grupos de clientes | formulario, lista, joins | OBSERVADO; semántica completa PENDIENTE | Confrontar reglas de negocio |
| Tarifas por artículo/servicio en LISTAS | 3 APIs y edición | OBSERVADO | Mantener trazabilidad con modelo ARTICULO |
| Aprobación/rehabilitación y vencimiento | APIs de otros menús | DEPENDENCIA OBSERVADA; menú propio no homologado | Auditar por separado |
| Correo a aprobadores permanentes | SendData | OBSERVADO; entrega no confirmada | Validar responsabilidades y notificaciones |
| Evolución clave 3→4, fechas, variante de correo | .bak/.bak2/.bak3/.bak4/_NE | HISTÓRICO OBSERVADO | Preservar e investigar versión productiva |
| Cliente Tasas por artículo | plantilla separada y variante vprod | OTRO MENÚ, PENDIENTE | Próxima ficha específica |
| DDL físico, integraciones y datos reales | Sólo SQL suelto/ZIP | PENDIENTE | Metadatos autorizados, nunca asumir |

**No resolver ahora equivalencia ni eliminación de funcionalidades.** El responsable decidió: **F00 documenta el legado y sus versiones**, después **F01 compara con todos los 50 requisitos del Linear**, luego **F02/F03 diseña un sistema NUEVO**. Las funciones antiguas no se descartan por estar tachadas, comentadas o reemplazadas parcialmente.

## 10. Resultado y aceptación

**Realizado:** revisión directa de fuente adjunta, matriz serializada, pantalla 1.126 líneas, siete endpoints directos, 12 objetos SQL, catálogo de campos, estados, listas de artículos, reglas de email y comparación de siete variantes de API + variante de plantilla; referencias de otros flujos diferenciadas.  
**NO realizado:** consultar DB1, verificar fecha de implantación, reconstruir todas las versiones históricas que no fueron entregadas, ejecutar SQL/PHP, verificar SMTP en vivo, revisar permisos con cuentas reales, mapear al 100% el menú moderno Cliente Tasas, comparar con RF/prototipo, validar en producción, obtener aprobación final.  
**Estado exacto:** **LEG-MEN-004 DOCUMENTADO ESTÁTICAMENTE (R01), VALIDACIÓN/HOMOLOGACIÓN PENDIENTE.**

**Siguiente paso de auditoría:** seleccionar `Comercial > Cliente Tasas` (modelo `TARIFA_CLIENTES_ARTICULOS`) como menú separado, con su variante histórica `cliente_tasa.edu.vprod06012020.php`, o continuar otra entrada de negocio según decisión del responsable. El orden no autoriza desarrollo ni merge.
