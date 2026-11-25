# TERPORT · F00-002 — Auditoría de router, menús, sesiones y efectos (R01)

**Fecha:** 2026-11-23. **Estado:** OBSERVADO por lectura estática del ZIP; NO probado en ejecución.
**Fuente:** terport.zip, SHA256 3e89b3e3d92549ff38990cc8296075ad3eb7788553fb5641246fc2eb6fd506a6.
**Publicación:** sólo metadatos/rutas/objetos no secretos. No se suben los PHP, configuraciones ni el SQL operativo.

## 1. Fuentes inspeccionadas
- index.php (714 líneas; SHA256 prefijo f607993a5265): startup/sesión L81–123; bypass de Agenda V2 L125–190; caches y tareas automáticas L317–500; despacho de API/páginas L507–714.
- classes/startup.edu.php: configuración, sesiones, lectura de matriz, URL, adaptador SQL y correo L3–70.
- configs/modules.edu.php (SHA256 prefijo 6f0586130715): menú serializado como datos PHP; leído sin ejecutar PHP ni deserializar en el servidor.
- templates/inc/sidebar.edu.php (SHA256 prefijo 7b3b2a97ff66): perfiles y renderización de navegación L1–167.
- comercial_v2/api.php y comercial_v2/seguridad.php: despacho y autorización de Agenda V2, independientes del router HTML antiguo.

## 2. Estructura de navegación declarada
| Módulo raíz | Tipo | Subentradas |
|---|---|---:|
| Dashboard | page | 0 |
| Sistema | submenu | 19 |
| Comercial | submenu | 11 |
| Reportes | submenu | 7 |
| Facturación | page | 0 |
| **Total** | **5 módulos** | **37 subentradas declaradas** |

37 entradas NO significa 37 pantallas visibles. La barra lateral sólo presenta subentradas con roles permitidos y etiqueta no vacía; hay varias sin etiqueta. Las listas de roles contienen repeticiones.
- sidebar.edu.php L1–15 y L70–81: Agenda Comercial, Miembros Comercial y Contratos se exhiben bajo Comercial según permisos, pero sus URLs reales siguen bajo adm/sistema/..., no se trasladaron físicamente.
- sidebar.edu.php L45 y L108–160: conducta diferencial de visualización de Facturación según el entorno/host; no publicar host interno.
- sidebar.edu.php L87–92: una lista de entradas heredadas se marca visualmente como depreciada; no equivale a eliminar la ruta.

## 3. Router y sesiones
- startup.edu.php L3–44: inicializa configuración, sesiones, matriz ADMIN_MODULES, URLs y adaptador de datos.
- index.php L88–111: timeout de sesión de 24 horas; API caducada puede producir respuesta 401; L116–123 presenta login anticipado sin inicializar caches para visitante sin sesión.
- index.php L125–190: rutas especiales de Agenda Comercial V2. Vista agenda_comercial_v2 admite GET, detalle_v2 admite POST; sesión y rol se revisan contra la matriz antes de cargar template.
- index.php L507–714: despacho general con página, lista y submenú, incluye denegación 403 y redirecciones; existe lógica de rutas parcialmente repetida que debe contrastarse antes de modernizar.
- comercial_v2/api.php L35–63: sólo POST, autentica vía v2InicioSeguro, despacha por accion, exige CSRF en escrituras y usa consultas parametrizadas.
- El código no fue ejecutado; la ruta HTML de V2 termina antes del bloque general de cache, pero las reglas precisas de acceso y dependencia por ambiente requieren confirmación en pruebas autorizadas.

## 4. Efectos de negocio dentro de index.php
ATENCIÓN: visitar algunas páginas antiguas puede generar trabajo en SQL. El index no es un router puramente de lectura.

| Líneas | Objetos SQL utilizados | Operación y efecto |
|---|---|---|
| 317–343 | CLIENTES (NUMERO, RAZONSOC, FACTURABLE), SYS_USUARIO (nombre) | SELECT y generación de archivos cache/clientes y cache/usuarios |
| 376–428 | UltMov01 (equipment_id, iso_code, ufv_gkey, ufv_time_in, iso_group, freight_kind, cargo_quantity, facility_id), ARTICULO (NUMERO, DESCRIP, AUXILIAR1, AUXILIAR3, FACTURABLE) | SELECT y creación/refresco de caches de operaciones y artículos |
| 432–449 | TABLAS (CLAVE, FUNCION) | SELECT y cache/listas |
| 451–500 | TARIFA_CLIENTES_ARTICULOS, CLIENTES, VENDEDOR, SYS_USUARIO, MIEMBROS_COMERCIAL, AGENDA_COMERCIAL_NOTIFICACIONES y AGENDA_COMERCIAL | SELECT y **INSERT en AGENDA_COMERCIAL y AGENDA_COMERCIAL_NOTIFICACIONES** cuando se identifica una tarifa por vencer; registra cache/vencimientos |

No afirmar que los INSERT sucedieron en producción: condiciones de cache, sesión, fechas y ruta aún no reproducidas. Existen excepciones para rutas de Agenda que omiten tareas globales (index.php L195–315), además de la ruta V2 de acceso directo.

## 5. Hallazgos y preguntas
| ID | Estado | Hallazgo / verificación pendiente |
|---|---|---|
| ROUT-01 | OBSERVADO | Router HTML con caminos duplicados; inventariar condiciones y diferencias |
| ROUT-02 | OBSERVADO | Tareas globales pueden producir escrituras de agenda y notificaciones; conservar esta regla en F01 |
| ROUT-03 | OBSERVADO | Sidebar, permisos de menu y autorización de ruta deben cotejarse por perfil |
| ROUT-04 | OBSERVADO | Agenda V2 separa rutas y conexión SQLSRV; no asumir equivalencia con Agenda original |
| ROUT-05 | PENDIENTE | Conciliar versión del ZIP con instalación efectivamente vigente de TERPORT |
| ROUT-06 | OBSERVADO | SCRIPTS-BBDD/BBDD-Limpio.sql incluye operaciones DDL/destructivas; no ejecutar |

## 6. Estado de cierre
Este documento **no es aprobación de funcionamiento**. El siguiente informe técnico es la primera ficha funcional detallada: LEG-MEN-001 Agenda Comercial V2. Continuar luego con los demás menús reales, un menú por vez. No ejecutar código, SQL, pruebas ni tareas Claude; no hacer merge sin aprobación humana.
