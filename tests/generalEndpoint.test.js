
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

  });

  describe("Swagger", () => {
    it("Swagger: GET /api/docs/ devuelve 200 con la página de documentación", async () => {
      const response = await requester.get("/api/docs/");

      expect(response.status).to.equal(200);
      expect(response.headers["content-type"]).to.include("text/html");
      expect(response.text).to.include("Swagger UI");
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
      ["/api/users/{id}/documents", "post", ["200", "400", "403", "404", "413", "415", "500"]],
      ["/api/deliveries/{id}/proof", "post", ["200", "400", "404", "413", "415", "500"]],
    ];

    it("Swagger: documenta los endpoints y respuestas que se prueban en la suite", () => {
        documentado.forEach(([path, method, codes]) => {
            const responses = swaggerSpec.paths?.[path]?.[method]?.responses

            expect(responses, `falta ${method.toUpperCase()} ${path} en la especificación`).to.exist
            codes.forEach((code) => {
                expect(responses, `${method.toUpperCase()} ${path}: falta la respuesta ${code}`).to.have.property(code)
            })
        })
    })

    it("Swagger: la especificación declara el servidor base", () => {
        expect(swaggerSpec.servers).to.be.an("array").with.lengthOf(1)
        expect(swaggerSpec.servers[0]).to.have.property("url", "http://localhost:8080")
    })
  });

  describe("Ruta inexistente", () => {
    it("Ruta inexistente: GET devuelve 404 RouteNotFound", async () => {
      const response = await requester.get("/api/ruta-que-no-existe");

      expectError(response, "ROUTE_NOT_FOUND");
    });

  });
});