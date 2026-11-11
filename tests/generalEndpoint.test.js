import { expect } from "chai";
import supertest from "supertest";
import dotenv from "dotenv";

import app from "../src/app.js";
import swaggerSpec from "../src/config/swagger.js";
import { ErrorDictionary } from "../src/utils/errors.js";

dotenv.config({ quiet: true });

const requester = supertest(app);

// Valida status HTTP + formato de error definido en utils/errors.js (name, code y message)
const expectError = (response, key) => {
  const { status, name, code, message } = ErrorDictionary[key];

  expect(response.status).to.equal(status);
  expect(response.body).to.have.property("status", "error");
  expect(response.body.error).to.have.all.keys("name", "code", "message");
  expect(response.body.error).to.have.property("name", name);
  expect(response.body.error).to.have.property("code", code);
  expect(response.body.error).to.have.property("message", message);
};

// Estos endpoints no usan la base de datos, así que no hace falta conectar ni limpiar nada
describe("Test de endpoints generales (logger, swagger y rutas inexistentes)", function () {
  this.timeout(10000);

  describe("Logger", () => {
    it("Logger: GET /api/loggerTest genera los logs y responde 200", async () => {
      const response = await requester.get("/api/loggerTest");

      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal({
        status: "success",
        message: "Logs generados correctamente",
      });
    });

    it("Logger: la respuesta incluye el header x-request-id", async () => {
      const response = await requester.get("/api/loggerTest");

      expect(response.headers).to.have.property("x-request-id");
      expect(response.headers["x-request-id"]).to.be.a("string").that.is.not
        .empty;
    });
  });

  describe("Swagger", () => {
    it("Swagger: GET /api/docs/ devuelve 200 con la página de documentación", async () => {
      const response = await requester.get("/api/docs/");

      expect(response.status).to.equal(200);
      expect(response.headers["content-type"]).to.include("text/html");
      expect(response.text).to.include("Swagger UI");
    });

    it("Swagger: la especificación tiene la información general de la API", () => {
      expect(swaggerSpec).to.have.property("openapi", "3.0.0");
      expect(swaggerSpec.info).to.have.property("title", "Shipnow");
      expect(swaggerSpec.paths).to.be.an("object").that.is.not.empty;
    });

    // Coherencia: lo que está documentado en Swagger tiene su test en la suite
    const documentado = [
      ["/api/users", "get", ["200"]],
      ["/api/users/{id}", "get", ["200", "400", "404"]],
      ["/api/users", "post", ["201", "400", "409"]],
      ["/api/users/{id}", "put", ["200", "400", "404"]],
      ["/api/users/{id}", "delete", ["200", "400", "404"]],
      ["/api/orders", "get", ["200"]],
      ["/api/orders/{id}", "get", ["200", "400", "404"]],
      ["/api/orders", "post", ["201", "400", "404"]],
      ["/api/orders/{id}", "put", ["200", "400", "404"]],
      ["/api/orders/{id}", "delete", ["200", "400", "404"]],
      ["/api/mocks/users", "get", ["200", "400"]],
      ["/api/mocks/drivers", "get", ["200", "400"]],
      ["/api/mocks/orders", "get", ["200", "400"]],
      ["/api/mocks/deliveries", "get", ["200", "400"]],
      ["/api/mocks/seed", "post", ["200", "400"]],
      ["/api/loggerTest", "get", ["200"]],
      ["/api/deliveries", "get", ["200"]],
      ["/api/deliveries/{id}", "get", ["200", "400", "404"]],
      ["/api/deliveries", "post", ["201", "400"]],
      ["/api/deliveries/{id}", "put", ["200", "400", "404"]],
      ["/api/deliveries/{id}", "delete", ["200", "400", "404"]],
    ];

    documentado.forEach(([path, method, codes]) => {
      it(`Swagger: documenta ${method.toUpperCase()} ${path} con las respuestas ${codes.join(", ")}`, () => {
        const responses = swaggerSpec.paths?.[path]?.[method]?.responses;

        expect(
          responses,
          `falta ${method.toUpperCase()} ${path} en la especificación`,
        ).to.exist;
        codes.forEach((code) => {
          expect(responses, `falta la respuesta ${code}`).to.have.property(
            code,
          );
        });
      });
    });
  });

  describe("Ruta inexistente", () => {
    it("Ruta inexistente: GET devuelve 404 RouteNotFound", async () => {
      const response = await requester.get("/api/ruta-que-no-existe");

      expectError(response, "ROUTE_NOT_FOUND");
    });

    it("Ruta inexistente: POST devuelve 404 RouteNotFound", async () => {
      const response = await requester.post("/ruta-que-no-existe").send({});

      expectError(response, "ROUTE_NOT_FOUND");
    });

    it("Ruta inexistente: un recurso conocido con un subpath inválido devuelve 404", async () => {
      const response = await requester.get("/api/mocks/no-existe");

      expectError(response, "ROUTE_NOT_FOUND");
    });
  });
});
