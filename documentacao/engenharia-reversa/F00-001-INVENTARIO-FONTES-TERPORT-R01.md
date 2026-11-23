# TERPORT — F00 · Inventario inicial de fuentes PHP (R01)

**Fecha:** 2026-11-23  
**Responsable:** análisis ChatGPT, validación del responsable PROCEIT.  
**Estado:** inspección inicial del ZIP recibido. **SIN publicación de código fuente completo, SIN ejecución de PHP/SQL, SIN desarrollo ni merge.**

## 1. Nueva política de separación documental

- **`proceit-tech/terport`:** material de análisis, instrucciones y documentación de trabajo para ChatGPT y Claude; conservar prototipo aceptado y trazabilidad. **Actualmente público: no guardar aquí secretos ni archivos operativos del cliente mientras no se vuelva privado.**
- **`proceit-tech/terportV2`:** exclusivamente el código ejecutable de aplicación y los archivos técnicos imprescindibles para desplegarlo en el servidor del cliente. No añadir nuevos documentos internos ni órdenes a este repositorio. La documentación interna que ya existe allí requiere migración y limpieza de historia antes de conceder acceso al cliente; borrar archivos no borra los commits históricos.
- **Linear:** incidencias, fases F00–F03, controles de avance y enlaces a documentación. Claude no desarrolla en F00.

## 2. Archivos de origen y verificación de integridad

Se recibieron dos adjuntos en la misma sesión: `terport.zip` y `terport(1).zip`. **Coinciden byte por byte** (mismo hash SHA-256):

`3e89b3e3d92549ff38990cc8296075ad3eb7788553fb5641246fc2eb6fd506a6`

Ambos ZIP contienen **1.787 entradas** totales, de las cuales **1.548 son archivos regulares**, carpeta raíz `terport/`, tamaño descomprimido aproximado **77,8 MiB**.

| Tipo | Cantidad de archivos |
|---|---:|
| PHP (`.php`) | 835 |
| JavaScript (`.js`) | 202 |
| CSS (`.css`) | 117 |
| Scripts SQL (`.sql`) | 20 |
| Copias `.bak` | 18 |
| Excel `.xlsx` | 13 |

**Ubicaciones significativas:**

| Directorio | Archivos | Rol aproximado pendiente de verificar |
|---|---:|---|
| `api/` | 134 | Endpoints PHP, operaciones, consultas |
| `templates/` | 55 | Vistas y menús |
| `configs/` | 19 | Configuración y navegación |
| `assets/` | 375 | JavaScript, estilos y recursos visuales |
| `SCRIPTS-BBDD/` | 21 | Scripts y referencias SQL (20 con extensión .sql en el ZIP total) |
| `comercial_v2/` | 9 | PHP del área comercial |
| `classes/` | 895 | Bibliotecas, acceso a datos y dependencias |
| `public/` | 15 | Recursos/archivos públicos y uploads |

Los directorios se superponen parcialmente en funciones y bibliotecas; el inventario por cantidad **no demuestra que todos los archivos estén activos**.

## 3. Control de información antes de cualquier importación

**Bloqueo de publicación de ZIP integral**: el archivo incluye carpetas `cache/`, `logs/`, `public/uploads/`, archivos PDF/XLSX de operación, múltiples `.bak`, `.orig`, `.phps` y variantes históricas de configuración. La inspección estática inicial detectó **patrones de conexión y asignación de credenciales** en varios archivos PHP y variantes de configuración. Estas coincidencias requieren inspección contextual, no son prueba de secretos válidos, pero **impiden publicar el ZIP completo en un repositorio público sin revisión**.

Ficheros prioritarios para revisión sin publicar sus contenidos sensibles: `configs/config.edu.php` y copias, `classes/mssql.edu.php` y variantes, `comercial_v2/conexion.php`, y scripts SQL. No copiar contenidos de cadenas de conexión, contraseñas, IP internas, certificados privados, PSK, logs o datos personales al repositorio ni a Linear.

**Estado de publicación:** este documento registra sólo metadatos no secretos; **los 1.548 archivos originales NO se han subido a GitHub**.

## 4. Secuencia de auditoría F00, sin alterar producción

1. Preservar ZIP original y SHA; crear inventario de archivos y duplicados de código, distinguiendo versión activa de backups.
2. Revisar código de entrada `index.php`, `configs/modules.edu.php` y navegación `templates/inc/sidebar.edu.php`; enumerar menús y roles **desde el código real**, no inventar.
3. Para cada menú, localizar vista PHP, API, JavaScript, includes y dependencias, y elaborar una ficha con funciones y flujos de lectura/escritura.
4. Confrontar con DDL disponible: por menú especificar tabla, columna, tipo, PK/FK, validación, SQL y evidencia; clasificar `OBSERVADO`, `INFERIDO`, `PENDIENTE` o `CONFIRMADO`.
5. Presentar la ficha al responsable para aceptación. Continuar con el menú siguiente.
6. F01: comparar con prototipo aceptado; F02: diseñar SQL Server V2 nuevo para DB1; F03: arquitectura, backlog y órdenes futuras al Claude.

**Reglas:** ninguna ejecución SQL, tests, despliegue, merge ni cambios del legado sin autorización; trabajar primero con el código fuente más reciente completo. Mantener cualquier acceso al DB1 separado del servidor web.

## 5. Próxima acción

Proceder al inventario real de menús y a la clasificación de archivos que deben quedar excluidos de Git; no confundir el prototipo React con el PHP legado. Antes de mover documentación desde `terportV2`, preservar commits y preparar una historia limpia de despliegue, sujeta a revisión y aprobación humana.
