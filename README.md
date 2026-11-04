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

Router: /api/mocks.

Permite generar datos ficticios sin guardarlos en MongoDB y cargar datos de prueba mediante un seed.

Método	Ruta	Descripción
GET	/api/mocks/users?qty=2	Genera usuarios
GET	/api/mocks/drivers?qty=2	Genera repartidores
GET	/api/mocks/orders?qty=2	Genera pedidos
GET	/api/mocks/deliveries?qty=2	Genera entregas
POST	/api/mocks/seed?qty=10	Inserta usuarios, pedidos y entregas en MongoDB

El parámetro qty es opcional. Por defecto genera 10 registros y permite un máximo de 50.

Los datos respetan los modelos y constantes del proyecto:

Usuarios con roles válidos.
Pedidos con estados y prioridades permitidos.
Entregas relacionadas con sus pedidos y repartidores.
Los pedidos cancelados no generan entregas, por lo que la cantidad de entregas puede ser menor que la cantidad de pedidos.

Ejemplos
bash
curl "http://localhost:8080/api/mocks/users?qty=2"

curl "http://localhost:8080/api/mocks/orders?qty=5"

curl -X POST "http://localhost:8080/api/mocks/seed?qty=10"
