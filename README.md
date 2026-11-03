## Arquitectura

El proyecto utiliza una arquitectura por capas:

- Controllers: gestionan las solicitudes HTTP y las respuestas.
- Services: contienen la lógica de negocio y las validaciones.
- Repositories: encapsulan las consultas a MongoDB mediante Mongoose.
- Models: definen los esquemas de datos.
- Config: centraliza y valida las variables de entorno.
- Constants: centraliza los valores inmutables del dominio.

Esta separación permite mantener el código modular,
facilita las pruebas y reduce el acoplamiento entre capas.