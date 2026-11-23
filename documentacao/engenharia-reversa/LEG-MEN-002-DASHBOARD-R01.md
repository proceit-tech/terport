# LEG-MEN-002 · Dashboard del sistema PHP TERPORT — ficha F00/R01

**Fecha de auditoría:** 23/11/2026  
**Estado:** DOCUMENTADO por lectura estática; **SIN homologación funcional ni ejecución SQL/PHP**.  
**Fuente original:** `terport.zip` y `terport(1).zip` idénticos, SHA-256 `3e89b3e3d92549ff38990cc8296075ad3eb7788553fb5641246fc2eb6fd506a6`.  
**Documento de trabajo:** repositorio PROCEIT `terport`, PR #2 Draft. No se incorporan PHP reales, datos de clientes, claves ni configuraciones privadas a un repositorio público.  
**Tipo:** pantalla raíz `dashboard`, distinta de la Agenda Comercial V2 ya documentada como LEG-MEN-001.

## 1. Identificación, origen y entradas

| Archivo original en ZIP | SHA-256 | Líneas | Función |
|---|---|---:|---|
| `templates/dashboard.edu.php` | `948fa85ede6ecfdbe33759c0165a4f5271361266e914cf64ed374a70f181eadd` | 844 | Pantalla, consultas SQL directas, HTML, botones y AJAX |
| `templates/dashboard.edu.php.bak` | `eeee8275dcd8fde2a1957b3423e1ac74e741fa5e30cf6592b77fd83f0d6abb6b` | 325 | Copia histórica; **NO** llamada por `_include('dashboard')` |
| `assets/data/morris-data.js` | `d35baa425d487ad88eae72fab6ef17bfd01eedc7dfb8a6bd32d2d98fdc074f3c` | 66 | Gráficos Morris y estados sin datos |
| `api/getNotificaionMarcarLeido.edu.php` | `42cdabd6029910f8067a76693f4859c62329de26a108f1b4f99cd921442c0ffe` | 12 | Marca aviso como leído |
| `api/getFacturacionContratosSendData.edu.php` | `a21710e52d69de215b15ff5207df8ac09080dd7f2f48ff25f56ee87b0232fcd8` | 102 | Genera pedido a partir de alerta contractual |
| `templates/inc/topbar.edu.php` | `4bc39a924ade5dd61c4197a2add7e31c9871de998412d61efe1ab20e6293654a` | 34 | Nombre, puerto y acceso de sesión |
| `index.php` | `f607993a5265db38d4795a52d6fc659793667d381e4940275be976528997493e` | 714 | Enrutamiento, control de sesión y posibles tareas previas |
| `classes/mssql.edu.php` | `9d9acf1f84ea163e1710d22b0c45a5d168d0d48ae626b86c79e306e9de0e6caf` | 213 | Adaptador SQLSRV; ExecuteReader/ExecuteNonQuery |
| `classes/functions.edu.php` | `62104c47de50e10b018f0d0d8338fd69061b13c651c48ac5a38ba5c1f97a2848` | 56 | Helpers `_include`, `sessions`, `posts`, `response` |

**Rutas observadas:** `/dashboard`, inicio `/` con sesión (ambos renderizan el template en `index.php`); `POST /api/getNotificaionMarcarLeido`; `POST /api/getFacturacionContratosSendData`; navegación vía formulario `POST /adm/sistema/agenda_comercial_detalle`, y links a `/adm/sistema/tarifasaprobadas`, `tarifasparaaprobar`, `tarifasavencer`, `tarifaseliminadas`.

**Roles declarados en `configs/modules.edu.php`:** `roles` incluye USUARIO, PRUEBA, APROBADOR, ADMINISTRADOR (ADMINISTRADOR duplicado); `roles2` incluye FACTURACION. El despachante `index.php` comprueba `roles` para la ruta `/dashboard`, no necesariamente `roles2`. A la vez el cuerpo del Dashboard tiene bloques específicos para FACTURACION. La posible divergencia entre acceso a `/`, `/dashboard` y menú exige validación con usuarios autorizados (no afirmar fallo en producción sin reproducir).

## 2. Bloques visibles y criterios de consulta

| Bloque | Archivo/líneas | Selección / filtro | UI / acción |
|---|---|---|---|
| Avisos individuales | dashboard L83–137 | `MIEMBROS_COMERCIAL_NOTIFICACIONES`, `USUARIO = sesión.id`, `LEIDO = 'N'` | Fecha de creación, texto y botón **Marcar como Leído** |
| Mensajes de negociación | L139–221 | Miembro de `MIEMBROS_COMERCIAL`; rol Comercial: mensajes de terceros sin leer de agendas propias; Gerencia Comercial/General: contactos pendientes según nivel/autor | Tarjetas y **Ir a la negociación** |
| Vencimientos de contratos | L223–293 | Sólo sesión con rol FACTURACION o APROBADOR; alertas ACTIVAS, sin `NROPED`, `FECHA_ALERTA` hasta hoy+4 días | Contrato, vencimiento, artículo y cliente; botón **Facturar ahora** |
| Aprobaciones comerciales | L295–361 | Miembro con rol `Gerencia%`; cotizaciones con `ESTADO_APLICACION NOT IN ('RECHAZADO','APLICADO')` | Tarjetas **Para Aprobar** y navegación al detalle |
| Indicadores de tarifas | L397–511 | COUNT aprobadas vigentes, provisorias vigentes, por vencer, eliminadas | Cuatro tarjetas, links al Sistema |
| Gráficos de facturación | L513–737 | Sólo ADMINISTRADOR/APROBADOR; consultas agregadas a `SYS_FACTURACION` | 7 días, 30 días, 6 meses; minutos medios de facturación por usuario |
| Navegación y script | L740–841 | jQuery, SweetAlert, Morris, Raphael, Bootstrap/MetisMenu | POST AJAX, formulario a detalle, recarga tras avisos/pedidos |

**No hay evidencia de paginación o límites TOP en las consultas de avisos/mensajes/aprobaciones de esta página.** No hay una tarea de recalculo de estadísticas en segundo plano específica del Dashboard; sus SELECT se ejecutan durante el render PHP.

## 3. Operaciones que cambian datos

### 3.1 Marcar aviso como leído
- Botón Dashboard L119–125 → JavaScript `_marcarComoLeido` L823–839 → `POST /api/getNotificaionMarcarLeido` enviando `ID_NOTIFICACION`.
- API `getNotificaionMarcarLeido.edu.php` L2–12: `UPDATE MIEMBROS_COMERCIAL_NOTIFICACIONES SET LEIDO='S', FECHA_HORA_LEIDO=GETDATE() WHERE ID='*?*'`.
- **Riesgos OBSERVADOS:** el WHERE no restringe `USUARIO` a la sesión; la API no contiene verificación explícita de rol ni comprueba el resultado de `ExecuteNonQuery`; devuelve `cod=00` aun si la operación devolvió 0. El enrutador genérico `index.php` incluye APIs existentes sin una autorización por API en ese bloque. **No declarar vulnerabilidad explotable sin prueba autorizada de los controles completos**, pero sí exigir autorización por recurso y usuario en V2.

### 3.2 Facturar alerta de contrato — creación de pedido
- `_facturarAlarma` en Dashboard L747–766 muestra confirmación; `_realizarFacturacion` L768–802 llama a `POST /api/getFacturacionContratosSendData` enviando `ALARMA_ID`.
- API `getFacturacionContratosSendData.edu.php` L5–37 consulta alerta + detalle + contrato + artículo + cliente, determina lista `02` para moneda E o `01` para otras, y construye número de pedido de la familia `CTR` desde contrato/secuencia.
- L39–63: `INSERT INTO PDCABEZA (...) SELECT ...`, con cliente, cotización `TC.VENTA` más reciente, transporte de `CLTESENTREGA`, moneda, contrato, usuario y número de pedido.
- L65–74: si la cabecera tiene éxito, `INSERT INTO PDITEMS (...) SELECT ...`, genera ITEM `001`, cantidad/bultos `1`, lista por moneda y datos del artículo.
- L76–87: si insertó detalle, `UPDATE CONTRATOS_PUERTO_DETALLE_ALERTAS`, fijando `NROPED`, `ESTADO='FACTURADO'`, fecha/hora y usuario.
- L89–100: responde `cod='00'` sólo si los tres pasos reportan éxito; en error devuelve códigos parciales `returCode`.
- **Importante:** el texto UI dice que insertará pedido en Waldbott, pero **este archivo no ejecuta HTTP hacia Waldbott**: realiza escrituras SQL en `PDCABEZA`/`PDITEMS` y actualiza alerta. Confirmar arquitectura de BD/ERP antes de llamar a esto integración externa directa.
- **Riesgos OBSERVADOS:** no hay BEGIN/COMMIT/ROLLBACK transaccional en el flujo de tres escrituras; `ExecuteNonQuery` abre/cierra conexión por llamada (`classes/mssql.edu.php` L13–55), de modo que puede persistir cabecera sin ítem o ambos sin marcar alerta. La API consulta por ID sin reconfirmar `ESTADO='ACTIVO'` ni `NROPED IS NULL` antes de insertar: riesgo de reprocesar en reintento/concurrencia. El valor del nombre de usuario se concatena como SQL literal para dos INSERT; el adaptador histórico sólo reemplaza marcadores `*?*` con escape de comillas, no garantiza parametrización completa del resto del SQL. No hay validación de rol/sesión explícita dentro de este archivo. **No ejecutar esta API durante la auditoría.**

### 3.3 Efectos transversales antes de abrir el Dashboard
- El `index.php` común (L317–500) puede crear/refrescar caches y ejecutar INSERT en `AGENDA_COMERCIAL` y `AGENDA_COMERCIAL_NOTIFICACIONES` cuando encuentra tarifas próximas a vencer; eso sucede **fuera del template**.
- La ruta especial de laboratorio local (index.php L278–289) sirve dashboard directo y omite esas tareas globales, exclusivamente cuando host y BD son locales. En entorno que no sea laboratorio, el router puede ejecutar el bloque previo antes de pintar el Dashboard.
- No confundir las notificaciones **MIEMBROS_COMERCIAL_NOTIFICACIONES** mostradas por el Dashboard con **AGENDA_COMERCIAL_NOTIFICACIONES** creadas por el proceso global. Son objetos distintos.

## 4. Inventario SQL / columnas — código real + DDL parcial

| Tabla / objeto | Campos observados y operación | Evidencia |
|---|---|---|
| `MIEMBROS_COMERCIAL_NOTIFICACIONES` | ID, USUARIO, FECHA_HORA_CREACION, TEXTO_NOTIFICACION, LEIDO (R/U), FECHA_HORA_LEIDO (U) | dashboard L85, API notificación L7; **DDL no encontrado en scripts ZIP** |
| `MIEMBROS_COMERCIAL` | id, usuario, rol (R) | dashboard L141–168, L295–300 |
| `DETALLE_AGENDA_COMERCIAL_COMENTARIOS` | ID_DETALLE_AGENDA, USUARIO_ID, LEIDO (R) | dashboard L150–167; **DDL no encontrado** |
| `DETALLE_AGENDA_COMERCIAL` | ID, ID_AGENDA, ID_SECUENCIA_CONTACTO, NIVEL_CONTACTO (R) | dashboard L150–167, L314–321 |
| `AGENDA_COMERCIAL` | ID, CLIENTE_NUMERO, USUARIO_ID (R), y efectos de escritura **sólo desde index.php** | dashboard L150–167, L314–321; index L451–500 |
| `CLIENTES` | NUMERO, RAZONSOC, CODFACT, CONDVTA, VENDEDOR (R) | dashboard L154/238/317; API contrato L47–59 |
| `CONTRATOS_PUERTO_DETALLE_ALERTAS` | ID, ID_DETALLE, ID_SECUENCIA_ALERTA, FECHA_ALERTA, FECHA_VENCIMIENTO, ESTADO (R/U), NROPED (R/U), FECHA_HORA_FACTURACION (U), USUARIO_FACTURACION (U) | dashboard L225–246; API contrato L8–28, L76 |
| `CONTRATOS_PUERTO_DETALLE` | ID, ID_CONTRATO, ARTICULO_NUMERO, MONEDA, PRECIO, PERIODICIDAD (R) | dashboard L240–246; API contrato L23–27, L47–72 |
| `CONTRATOS_PUERTO` | ID, NUMERO_CONTRATO, ANHO_CONTRATO, CLIENTE_NUMERO (R) | dashboard L242–246; API contrato L26–27, L37 |
| `ARTICULO` | NUMERO, DESCRIP (R) | dashboard L241; API contrato L25/L58/L70 |
| `DETALLE_AGENDA_COMERCIAL_COTIZACION` | ID_DETALLE_AGENDA, ESTADO_APLICACION (R) | dashboard L318–321 |
| `TARIFA_CLIENTES_ARTICULOS_ESTADO` | ID_TARIFA_CLIENTE_ARTICULO, estado, FecVcto (R) | dashboard L413–495 |
| `TARIFA_CLIENTES_ARTICULOS` | ID, FecVcto (R) | dashboard L413–441 |
| `SYS_FACTURACION` | fecha_emision, total_a_pagar_ml, total_a_pagar_me, usuario, fecha_hora_inicio, fecha_hora_fin (R) | dashboard L665–710 |
| `PDCABEZA` | TIPO, CLIENTE, NROPED, CODIGO, FECEMISION, FECRECEP, CONDVENTA, ACTUALIZA, BONIFICA1/2, VENDEDOR, TRANSPORTE, REFERENCIA, CONGELA, MONEDAINGR, MONEDAEMIS, ESTADO, OPERACION, CONGELACOT, COTIZACION, FECALTA, USUARIO, VALOR_FACTURA, FLETE, SEGURO, RAZONSOC, NROREAL (I) | API contrato L39–61; **DDL no encontrado** |
| `PDITEMS` | TIPO, CLIENTE, NROPED, ITEM, ARTICULO, DESCART, PRESENTA, LISTA, DESCUENTO, PRECIO, CANTPED, BULTPED, DEPSALIDA, FECRECEP, CUMPLIDO, TEUS, USUARIO, DESPACHO, PARTIDA (I) | API contrato L65–72; **DDL no encontrado** |
| `CLTESENTREGA` | CLIENTE, TRANSPORTE (R) | API contrato L59/L71 |
| `TC` | VENTA, Fecha (R) | API contrato L51 |

**18 tablas/objetos distintos** referenciados por la pantalla y sus dos APIs directas. Se excluye de esta cuenta la creación indirecta de `AGENDA_COMERCIAL_NOTIFICACIONES` desde `index.php`; incluyendo esa tarea transversal son **19 nombres SQL distintos**. No están verificadas todas las estructuras físicas ni si existen vistas/sinónimos en la instancia vigente.

**DDL verificable en ZIP:** `SCRIPTS-BBDD/estructura-tablas-comercial.sql` L91–131 y `BBDD-Limpio.sql` L436–475 definen las tres tablas CONTRATOS_PUERTO, CONTRATOS_PUERTO_DETALLE, CONTRATOS_PUERTO_DETALLE_ALERTAS. Campos representativos: ID int identity; FECALTA datetime; contrato CLIENTE_NUMERO varchar(7); precio detalle float; moneda nvarchar(1); alerta ID_DETALLE FK int, FECHA_ALERTA / FECHA_VENCIMIENTO date, ESTADO varchar(20), NROPED varchar(20), FECHA_HORA_FACTURACION datetime, USUARIO_FACTURACION int FK. **Esquema de referencia, no DDL confirmado de producción.**

## 5. Cálculos e indicadores — reglas exactas observadas

| Indicador | Regla en archivo | Limitación/interpretación |
|---|---|---|
| Tarifas aprobadas | COUNT TCAE.estado='APROBADO' y TCA.FecVcto >= fecha actual PHP | Ignora expiradas, suma estados históricos si no se filtra versión/duplicado; relación definida por ID |
| Tarifas provisorias | COUNT estado='PROVISORIO', vencimiento futuro | Distinto de una aprobación de negociación |
| Tarifas por vencer | COUNT de estado-tarifas con `DATEDIFF(month, GETDATE(), FecVcto) <= 1` y FecVcto > GETDATE() | Diferencia de meses calendario, **no necesariamente 30 días exactos**, ni filtra estado |
| Tarifas eliminadas | COUNT estado='ELIMINADO' | No filtra por fecha |
| Facturación 7 días y 30 días | SUM de `total_a_pagar_ml` convertido a bigint y `total_a_pagar_me` convertido a float, agrupada por fecha_emision convertida a date estilo 103 | Convertir a bigint puede truncar fracciones; `TRY_CONVERT` puede excluir fechas no parseables |
| Facturación 6 meses | Mismo SUM por YEAR y MONTH de fecha_emision; formatea mes YYYY-MM-01 | Ventana móvil 6 meses hacia atrás, distinta de 6 meses calendario completos |
| Tiempo medio de facturación | SUM de DATEDIFF(minute, fecha_hora_inicio, fecha_hora_fin) / COUNT(usuario), por usuario, sólo duraciones <60 | No excluye duraciones negativas; valores NULL de fecha no suman pero COUNT(usuario) sí puede contarlos; orden aleatorio NEWID |

Gráficos se construyen en PHP L602–734 como JSON con `JSON_HEX_*` y fallback a `[]` ante datos inválidos. La biblioteca `assets/data/morris-data.js` L9–65 muestra “Sin datos...” cuando la serie está vacía. **No se ha comprobado el resultado visual con datos reales**.

## 6. Hallazgos de auditoría para priorización futura (sin corregir código)

| ID | Prioridad | Evidencia concreta | Consecuencia a verificar |
|---|---|---|---|
| DASH-01 | Alta | API notificación L7: UPDATE WHERE ID, sin USUARIO/sesión; API siempre cod=00 | Otro ID podría marcar aviso ajeno; verificar controles del router, permisos por recurso y CSRF |
| DASH-02 | Crítica de integridad | API contrato L39–87: 3 operaciones SQL separadas, sin transacción ni condición de unicidad/reintento | Cabecera/ítem/estado de alerta podrían quedar inconsistentes y reintentos duplicar pedido |
| DASH-03 | Alta | API contrato L5–28 no valida estado/nroped; INSERT mezcla valores construidos en SQL | Evitar procesar alertas ya facturadas y errores de autorización antes de migrar |
| DASH-04 | Alta | Dashboard L110–113 imprime texto de aviso sin escape HTML; L201/347 construyen onclick con datos SQL | Posibilidad de HTML/JS no deseado si datos no confiables; requiere evaluación contextual |
| DASH-05 | Media | Dashboard L148–170: `switch` sin default y ejecución posterior de `ExecuteReader($sql_mensajes)` | Rol de miembro inesperado podría llevar a variable no definida o consulta equivocada |
| DASH-06 | Media | L365–395 hay HTML comentado, pero PHP de L377–379 se sigue ejecutando dentro del comentario HTML | Cuenta “Tarifas a vencer” dos veces sin aportar tarjeta visible |
| DASH-07 | Media | Contratos L245: condición `FECHA_ALERTA <= hoy OR FECHA_ALERTA <= hoy+4` | Primera rama redundante; equivale a segunda condición, requiere confirmar reglas de aviso |
| DASH-08 | Media | Dashboard L513–581/602–738: gráficas sólo ADMINISTRADOR/APROBADOR; módulo declara FACTURACION en roles2 | Comprobar diferencia de acceso `/` versus `/dashboard` y rol real |
| DASH-09 | Media | SUM ML convierte a bigint; promedio usa COUNT(usuario), orden NEWID | Indicadores pueden distorsionar redondeos y promedios bajo datos reales |
| DASH-10 | Alta | Dashboard muestra “Waldbott”, API contrato únicamente escribe SQL en PDCABEZA/PDITEMS | Documentar interfaz real de datos; no afirmar integración HTTP que no existe en esta API |
| DASH-11 | Alta | Index L317–500 ejecuta caches/avisos y posibles INSERT antes de Dashboard, salvo bypass laboratorio | Leer este menú **no es operación inocua** en algunas rutas; no ejecutarlo contra SQL productivo durante auditoría |
| DASH-12 | Media | DDL parcial; backup dashboard distinto del activo; topbar depende de sesión y puerto | Validar versión productiva de frontend/driver, objetos físicos y permisos |

**Comentario de seguridad:** este Dashboard incluye un comentario antiguo con datos de una cuenta de prueba. **No reproducirlo ni publicarlo**. La presencia de datos históricos en el código exige limpieza antes de mover fuentes a un repo visible al cliente; no presupone que la cuenta siga activa.

## 7. Cobertura, vínculos y estado

- **Inventario UI:** completo para `templates/dashboard.edu.php` activo del ZIP. Se comparó su presencia con `.bak` por existencia/tamaño, **no se validó equivalencia funcional**.
- **Dependencias directas:** topbar, sidebar, Morris/Bootstrap/MetisMenu/SweetAlert/jQuery, dos APIs, 18 nombres SQL directos y 1 nombre extra de tarea transversal.
- **Campos con DDL verificado:** sólo subset de CONTRATOS_PUERTO* en scripts históricos. Para resto (especialmente PDCABEZA/PDITEMS, SYS_FACTURACION y notificaciones), **tipo/nullable/PK/FK pendiente**.
- **Módulos relacionados:** Agenda Comercial tradicional y cotizaciones; Contratos; Facturación/ERP; Tarifas; auditoría/notificaciones; permisos usuarios.
- **Pruebas dinámicas, autorizaciones reales, interacción DB1, integración Waldbott:** NO realizadas.
- **Criterio de cierre LEG-MEN-002:** documento técnico publicado en PR Draft, revisión del responsable, contraste con SQL real y aceptación de pendiente; NO homologado ni listo para desarrollo.

**Siguiente menú pendiente:** definir tras revisión, sin ejecutar Claude y sin tocar `terportV2`.
