## Arquitectura

El proyecto utiliza una arquitectura por capas:

- **Controllers:** gestionan las solicitudes HTTP y las respuestas.
- **Services:** contienen la lógica de negocio y las validaciones.
- **Repositories:** encapsulan las consultas a MongoDB mediante Mongoose.
- **Models:** definen los esquemas de datos.
- **Config:** centraliza y valida las variables de entorno.
- **Constants:** centraliza los valores inmutables del dominio, como estados, roles y la configuración de carga de archivos.
- **Middlewares:** logger HTTP, manejo global de errores y la configuración centralizada de Multer (`src/middlewares/uploadMiddleware.js`).

Esta separación permite mantener el código modular, facilita las pruebas y reduce el acoplamiento entre capas. Los Services aplican las reglas de negocio, mientras que los Repositories se encargan exclusivamente del acceso a los datos.

## Instalación y ejecución

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/melisazatta/shipnow-app.git
   cd shipnow-app
   ```

2. Instalar las dependencias:

   ```bash
   npm install
   ```

3. Crear el archivo `.env` a partir de `.env.example` y completar las variables necesarias:

   ```env
   PORT=8080
   NODE_ENV=development
   MONGODB_URI=tu_uri_de_mongodb          # base de desarrollo, ej. .../shipnow
   MONGODB_URI_TEST=tu_uri_de_testing     # base de testing, debe terminar en _test
   JWT_SECRET=tu_secreto_jwt
   # UPLOADS_DIR=uploads                  # opcional: carpeta de archivos subidos
   ```

4. Iniciar el servidor:

   ```bash
   npm run dev
   ```

La configuración valida las variables de entorno al iniciar la aplicación. Si falta una variable crítica, el servidor muestra un error descriptivo y no arranca.

## API

Los endpoints están organizados por recursos y conectados a sus respectivos Controllers, Services y Repositories.

La API utiliza MongoDB como base de datos y Mongoose para la definición de modelos y el acceso a los datos.


## Mocking y datos de prueba

Router: `/api/mocks`.

Permite generar datos ficticios sin guardarlos en MongoDB y cargar datos de prueba mediante un seed.

### Endpoints disponibles

**GET - Generación de datos (sin guardar en MongoDB)**

- `GET /api/mocks/users?qty=2` — Genera usuarios.
- `GET /api/mocks/drivers?qty=2` — Genera repartidores.
- `GET /api/mocks/orders?qty=2` — Genera pedidos.
- `GET /api/mocks/deliveries?qty=2` — Genera entregas.

**POST - Carga de datos en MongoDB**

- `POST /api/mocks/seed?qty=10` — Inserta usuarios, pedidos y entregas.

El parámetro `qty` es opcional. Por defecto genera 10 registros y permite un máximo de 50.

### Características

- Usuarios con roles válidos.
- Pedidos con estados y prioridades permitidos.
- Entregas relacionadas con sus pedidos y repartidores.
- Contraseñas almacenadas con hash bcrypt.
- Los pedidos cancelados no generan entregas, por lo que la cantidad de entregas puede ser menor que la cantidad de pedidos.

### Ejemplos de uso

- "http://localhost:8080/api/mocks/users?qty=2"
- "http://localhost:8080/api/mocks/orders?qty=5"
- POST "http://localhost:8080/api/mocks/seed?qty=10"

## Carga de archivos (Multer)

Permite subir documentos de usuario y comprobantes de entrega mediante `multipart/form-data`. El archivo se guarda en el servidor y en MongoDB se registran **solo sus metadatos**, asociados a la entidad (usuario o entrega). Nunca se guarda el archivo dentro de la base.

### Endpoints

| Endpoint | Campo del archivo | Campos adicionales | Qué hace |
|---|---|---|---|
| `POST /api/users/:id/documents` | `document` | `type` (opcional): `user_document` (por defecto) o `driver_license` | Guarda el documento en `uploads/documents` y lo registra en `documents` del usuario. |
| `POST /api/deliveries/:id/proof` | `proof` | ninguno | Guarda el comprobante en `uploads/proofs` y lo registra en `proofs` de la entrega. |

Ambos devuelven la entidad actualizada: `{ status, message, payload }`.

Reglas:

- Formatos aceptados: **PDF, JPG y PNG**. Tamaño máximo: **5 MB**. Un archivo por petición.
- La licencia de conducir (`driver_license`) solo la puede subir un usuario con rol `driver`.
- Si la validación falla después de que Multer guardó el archivo, el archivo se borra del servidor: no quedan archivos huérfanos.

### Configuración de Multer

Está centralizada en `src/middlewares/uploadMiddleware.js` (los routers solo importan el uploader que necesitan) y usa los valores de `UPLOAD_CONFIG` en `src/constants/index.js`:

- **Dónde se guarda:** `<UPLOADS_DIR>/<subcarpeta>`. Por defecto `uploads/`, y `uploads/test/` durante los tests.
- **Cómo se nombra:** `<timestamp>-<número aleatorio>.<extensión>`. Nunca se usa el nombre original en disco.
- **Tipos aceptados y tamaño máximo:** `UPLOAD_CONFIG.ALLOWED_MIME_TYPES` y `UPLOAD_CONFIG.MAX_FILE_SIZE`.
- **Errores de carga:** los de Multer (tamaño, campo inesperado) y los de disco se traducen en el `errorHandler` global a errores del diccionario.

### Estructura de carpetas

```
uploads/
├── documents/   documentos y licencias de usuario
├── receipts/    comprobantes de pedidos (uploader disponible)
└── proofs/      comprobantes de entrega
```

`uploads/` está en `.gitignore`: los archivos subidos no se suben al repositorio. Las carpetas se crean solas al iniciar la aplicación. Los archivos **no se sirven públicamente por URL**.

### Metadatos que se guardan

| Campo | Descripción |
|---|---|
| `originalName` | Nombre original del archivo |
| `fileName` | Nombre generado por el servidor |
| `path` | Ruta del archivo en el servidor |
| `mimeType` | Tipo MIME |
| `size` | Tamaño en bytes |
| `type` | Tipo de documento: `user_document`, `driver_license` o `delivery_proof` |
| `uploadedAt` | Fecha de carga |

### Errores de carga de archivos

Responden con el mismo formato que el resto de la API (ver "Manejo de errores").

| Situación | Status | `name` | `code` |
|---|---|---|---|
| No se envió el archivo | 400 | `FileRequired` | 6 |
| Tipo de documento inválido | 400 | `InvalidDocumentType` | 6 |
| El campo del archivo no es el esperado (`document` / `proof`) | 400 | `UnexpectedFileField` | 6 |
| Otro error de Multer | 400 | `FileUploadError` | 6 |
| ID inválido | 400 | `InvalidId` | 2 |
| Un usuario que no es driver sube una licencia | 403 | `DocumentNotAllowed` | 6 |
| Usuario o entrega no encontrados | 404 | `UserNotFound` / `DeliveryNotFound` | 4 |
| Archivo mayor a 5 MB | 413 | `FileTooLarge` | 6 |
| Formato no permitido | 415 | `InvalidFileType` | 2 |
| Falla al guardar en disco | 500 | `FileSaveError` | 8 |

### Logging

- `info`: documento cargado, y comprobante asociado a una entrega.
- `warning`: intento de subir un tipo de archivo no permitido, y errores de carga 4xx capturados por el `errorHandler`.
- `error`: fallas al guardar el archivo (5xx).

### Cómo probarlo

Con Swagger (`/api/docs`) usando **Try it out** y eligiendo el archivo, con Postman (**Body → form-data**, el campo del archivo en tipo *File*) o con curl:

```bash
curl -X POST http://localhost:8080/api/users/<id>/documents \
  -F "document=@./dni.pdf" \
  -F "type=user_document"

curl -X POST http://localhost:8080/api/deliveries/<id>/proof \
  -F "proof=@./comprobante.pdf"
```

Ejemplo de respuesta (comprobante de entrega, abreviada):

```json
{
  "status": "success",
  "message": "Comprobante subido exitosamente",
  "payload": {
    "_id": "6aeadef9eff017f303961a4a",
    "status": "pending",
    "proofs": [
      {
        "originalName": "comprobante.pdf",
        "fileName": "1794449765149-586089037.pdf",
        "path": "uploads/proofs/1794449765149-586089037.pdf",
        "mimeType": "application/pdf",
        "size": 48213,
        "type": "delivery_proof",
        "uploadedAt": "2026-11-12T15:20:11.391Z"
      }
    ]
  }
}
```

## Manejo de errores

Los errores se detectan en los Services (con errores personalizados del diccionario en `utils/errors.js`) y la respuesta al cliente sale únicamente del middleware global `errorHandler`.

### Estructura de la respuesta de error

```json
{
  "status": "error",
  "error": {
    "name": "InvalidQuantity",
    "code": 6,
    "message": "qty debe ser mayor a 0"
  }
}
```

- `name`: identifica el error (ej. `UserNotFound`, `InvalidQuantity`).
- `code`: categoría (`1` ruta, `2` tipo inválido, `3` base de datos, `4` no encontrado, `5` ya existe, `6` propiedad inválida, `7` configuración, `8` error al guardar un archivo).
- `message`: descripción legible. El status HTTP coincide con el del diccionario.

### Cómo probar los casos inválidos

| Request | Status | `name` |
|---|---|---|
| `GET /api/mocks/users?qty=abc` | 400 | `InvalidQuantity` |
| `GET /api/mocks/users?qty=-5` | 400 | `InvalidQuantity` |
| `GET /api/mocks/users?qty=999` | 400 | `InvalidQuantity` |
| `POST /api/mocks/seed` con MongoDB caído | 500 | `DatabaseError` |
| `GET /api/users/<id inexistente>` | 404 | `UserNotFound` |
| `POST /api/products` con `price: -5` | 400 | `InvalidPrice` |
| `GET /api/ruta-inexistente` | 404 | `RouteNotFound` |

## Logging

Se usa **Winston** como logger centralizado (`src/utils/logger.js`), con rotación diaria de archivos mediante `winston-daily-rotate-file`.

### Niveles

De mayor a menor gravedad: `fatal`, `error`, `warning`, `info`, `http`, `debug`.

El logger registra el nivel configurado y todos los más graves.

### Cómo probarlo

`GET /api/loggerTest` genera un log de cada nivel. Aparecen en consola y, además, `error` y `fatal` se guardan en el archivo de errores.

También se registran: inicio del servidor, conexión a MongoDB, creación de usuarios y pedidos, generación de mocks, carga de archivos y errores capturados por el middleware global (4xx como `warning`, 5xx como `error`).

### Archivos de logs

- Ruta: `logs/errors-AAAA-MM-DD.log`.
- Contienen solo los niveles `error` y `fatal`.
- Rotación diaria, conservando 14 días.
- `logs/` y `*.log` están en `.gitignore`: los archivos generados no se suben al repositorio.

### Según el entorno

| Entorno | Nivel por defecto | Formato de consola |
|---|---|---|
| `development` | `debug` | Texto legible con colores |
| `production` | `info` | JSON |

La variable opcional `LOG_LEVEL` fuerza un nivel y tiene prioridad sobre el entorno.

## Documentación de API (Swagger)

La API cuenta con documentación interactiva mediante Swagger UI, disponible en:

`http://localhost:8080/api/docs`

Permite consultar y probar los endpoints de los módulos **Users, Products, Orders, Deliveries, Mocks y Logger**, incluyendo parámetros, cuerpos de petición, respuestas y errores. Los endpoints de carga de archivos están documentados como `multipart/form-data`, con el nombre del campo del archivo, los campos adicionales, los formatos aceptados, la respuesta exitosa y los errores posibles.

La documentación utiliza OpenAPI y schemas reutilizables.

## Testing

### Herramientas
- **Mocha**: organiza y ejecuta los tests.
- **Chai**: aserciones (`expect`).
- **Supertest**: peticiones HTTP contra la app Express, sin abrir un puerto
  (`app.js` está separado de `server.js`).

### Cómo ejecutar los tests
```bash
npm install
npm test
```
`npm test` fija `NODE_ENV=test`, silencia los logs y corre `tests/**/*.test.js`.

### Módulos cubiertos
| Archivo | Cubre |
|---|---|
| `tests/usersEndpoint.test.js` | Usuarios: crear, listar, buscar por ID, actualizar, eliminar |
| `tests/ordersEndpoint.test.js` | Pedidos: listar, crear, buscar por ID, actualizar estado, eliminar |
| `tests/deliveriesEndpoint.test.js` | Entregas: listar, crear, buscar por ID, actualizar, eliminar |
| `tests/mocksEndpoint.test.js` | Mocks (users, drivers, orders, deliveries) y `POST /api/mocks/seed` |
| `tests/generalEndpoint.test.js` | Logger, Swagger (`/api/docs/`) y rutas inexistentes |
| `tests/uploadsEndpoint.test.js` | Carga de archivos: documentos de usuario y comprobantes de entrega |

Cada recurso tiene casos exitosos y de error (datos incompletos, recurso inexistente, estado inválido, qty inválida, ruta inexistente). En los errores se valida el status HTTP y el formato { status, error: { name, code, message } } definido en src/utils/errors.js. También se verifica que Swagger documente los comportamientos probados.

Los tests de carga cubren la subida correcta (archivo guardado y solo metadatos en la base), archivo faltante, tipo de documento inválido, entidad inexistente, formato no permitido, tamaño excedido y campo inesperado. Los archivos de prueba se guardan en `uploads/test/` y se borran al terminar cada test.

### Base de datos de testing
**Sí, se requiere una base separada.** Los tests usan `MONGODB_URI_TEST`, que debe
apuntar a una base cuyo nombre termine en `_test` (por ejemplo `shipnow_test`).
Si no termina en `_test`, los tests se abortan antes de borrar nada.

Los datos se crean dentro de cada test y se limpian con hooks
(`before` / `beforeEach` / `after`), por lo que la suite es repetible.

### Variables de entorno necesarias
| Variable | Descripción |
|---|---|
| `PORT` | Puerto de la app |
| `NODE_ENV` | `development` o `production` (`npm test` fija `test` solo) |
| `JWT_SECRET` | Secreto de la app |
| `MONGODB_URI` | Base de desarrollo |
| `MONGODB_URI_TEST` | Base de testing (nombre terminado en `_test`) |
| `UPLOADS_DIR` | Opcional. Carpeta de archivos subidos (por defecto `uploads`, y `uploads/test` en los tests) |