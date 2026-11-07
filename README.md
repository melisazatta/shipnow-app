## Arquitectura

El proyecto utiliza una arquitectura por capas:

- **Controllers:** gestionan las solicitudes HTTP y las respuestas.
- **Services:** contienen la lógica de negocio y las validaciones.
- **Repositories:** encapsulan las consultas a MongoDB mediante Mongoose.
- **Models:** definen los esquemas de datos.
- **Config:** centraliza y valida las variables de entorno.
- **Constants:** centraliza los valores inmutables del dominio, como estados y roles.

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
   MONGODB_URI=tu_uri_de_mongodb
   JWT_SECRET=tu_secreto_jwt
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
- `code`: categoría (`1` ruta, `2` tipo inválido, `3` base de datos, `4` no encontrado, `5` ya existe, `6` propiedad inválida, `7` configuración).
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

También se registran: inicio del servidor, conexión a MongoDB, creación de usuarios y pedidos, generación de mocks y errores capturados por el middleware global (4xx como `warning`, 5xx como `error`).

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

Permite consultar y probar los endpoints de los módulos **Users, Orders, Deliveries, Mocks y Logger**, incluyendo parámetros, cuerpos de petición, respuestas y errores.

La documentación utiliza OpenAPI y schemas reutilizables.