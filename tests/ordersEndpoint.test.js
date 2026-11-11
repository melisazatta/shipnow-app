import { expect } from "chai"
import supertest from "supertest"
import mongoose from "mongoose"
import dotenv from "dotenv"

import app from "../src/app.js"
import User from "../src/models/user.model.js"
import Order from "../src/models/order.model.js"
import Delivery from "../src/models/delivery.model.js"
import { ErrorDictionary } from "../src/utils/errors.js"
import { ORDER_STATUS } from "../src/constants/index.js"

dotenv.config({ quiet: true })

const requester = supertest(app)

const customerData = {
    firstName: "Maria",
    lastName: "Lopez",
    email: "maria_lopez@gmail.com",
    password: "123456"
}

const items = [
    { name: "Auriculares", quantity: 2, price: 50 },
    { name: "Cable USB", quantity: 1, price: 10 }
]

const idInvalido = "123abc"
const idInexistente = new mongoose.Types.ObjectId().toString()

let customerId = ""
let orderId = ""

const cleanDb = () =>
    Promise.all([Delivery.deleteMany({}), Order.deleteMany({}), User.deleteMany({})])

// Valida status HTTP + formato de error definido en utils/errors.js (name, code y message)
const expectError = (response, key) => {
    const { status, name, code, message } = ErrorDictionary[key]

    expect(response.status).to.equal(status)
    expect(response.body).to.have.property("status", "error")
    expect(response.body.error).to.have.all.keys("name", "code", "message")
    expect(response.body.error).to.have.property("name", name)
    expect(response.body.error).to.have.property("code", code)
    expect(response.body.error).to.have.property("message", message)
}

describe("Test de endpoints de orders", function () {
    this.timeout(10000)

    before(async () => {
        await mongoose.connect(process.env.MONGODB_URI_TEST, { serverSelectionTimeoutMS: 5000 })

        // Guard: nunca borrar si la base no es de testing
        if (!mongoose.connection.name.endsWith("_test")) {
            const nombre = mongoose.connection.name
            await mongoose.disconnect()
            throw new Error(`La base "${nombre}" no es de testing. Abortando para no borrar datos.`)
        }
    })

    // Cada test arranca con un cliente y un pedido propios: no depende del orden
    beforeEach(async () => {
        await cleanDb()

        const customer = await User.create(customerData)
        customerId = String(customer._id)

        const order = await Order.create({
            customer: customerId,
            deliveryAddress: "Av. Siempre Viva 742",
            items,
            declaredValue: 110,
            shippingCost: 10,
            total: 120
        })
        orderId = String(order._id)
    })

    after(async () => {
        await cleanDb()
        await mongoose.disconnect()
    })

    describe("Listar", () => {
        it("Listar: Obtener todos los pedidos", async () => {
            const response = await requester.get("/api/orders")

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property("status", "success")
            expect(response.body.payload).to.be.an("array").with.lengthOf(1)

            const order = response.body.payload[0]
            expect(order).to.have.property("_id", orderId)
            expect(order).to.have.property("deliveryAddress", "Av. Siempre Viva 742")
            expect(order).to.have.property("status", ORDER_STATUS.CREATED)
            expect(order.items).to.be.an("array").with.lengthOf(2)
            // El cliente viene populado, sin la contraseña
            expect(order.customer).to.have.property("firstName", "Maria")
            expect(order.customer).to.have.property("email", "maria_lopez@gmail.com")
            expect(order.customer).to.not.have.property("password")
        })

        it("Listar: Devuelve un array vacío si no hay pedidos", async () => {
            await Order.deleteMany({})

            const response = await requester.get("/api/orders")

            expect(response.status).to.equal(200)
            expect(response.body.payload).to.be.an("array").that.is.empty
        })
    })

    describe("Buscar por id", () => {
        it("Buscar por id: Pedido encontrado", async () => {
            const response = await requester.get(`/api/orders/${orderId}`)

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property("status", "success")
            expect(response.body.payload).to.have.property("_id", orderId)
            expect(response.body.payload).to.have.property("deliveryAddress", "Av. Siempre Viva 742")
            expect(response.body.payload).to.have.property("status", ORDER_STATUS.CREATED)
            expect(response.body.payload).to.have.property("priority", "normal")
            expect(response.body.payload).to.have.property("total", 120)
            expect(response.body.payload.customer).to.have.property("_id", customerId)
            expect(response.body.payload.items).to.have.lengthOf(2)
            expect(response.body.payload.delivery).to.be.null
        })

        it("Buscar por id: ID inválido", async () => {
            const response = await requester.get(`/api/orders/${idInvalido}`)

            expectError(response, "INVALID_ID")
        })

        it("Buscar por id: Pedido no encontrado", async () => {
            const response = await requester.get(`/api/orders/${idInexistente}`)

            expectError(response, "ORDER_NOT_FOUND")
        })
    })

    describe("Crear", () => {
        it("Crear: Pedido con datos válidos, calcula los montos", async () => {
            const response = await requester.post("/api/orders").send({
                customer: customerId,
                deliveryAddress: "Calle Falsa 123",
                items
            })

            expect(response.status).to.equal(201)
            expect(response.body).to.have.property("status", "success")

            const created = response.body.payload
            expect(created).to.have.property("_id")
            expect(created).to.have.property("customer", customerId)
            expect(created).to.have.property("deliveryAddress", "Calle Falsa 123")
            expect(created).to.have.property("status", ORDER_STATUS.CREATED)
            expect(created).to.have.property("priority", "normal")
            expect(created).to.have.property("declaredValue", 110) // 2*50 + 1*10
            expect(created).to.have.property("shippingCost", 10)   // fuera de producción es fijo
            expect(created).to.have.property("total", 120)
            expect(created.items).to.be.an("array").with.lengthOf(2)
            expect(created.items[0]).to.include({ name: "Auriculares", quantity: 2, price: 50 })

            expect(await Order.countDocuments()).to.equal(2)
        })

        it("Crear: Respeta la prioridad enviada", async () => {
            const response = await requester.post("/api/orders").send({
                customer: customerId,
                deliveryAddress: "Calle Falsa 123",
                items,
                priority: "high"
            })

            expect(response.status).to.equal(201)
            expect(response.body.payload).to.have.property("priority", "high")
        })

        it("Crear: Faltan campos obligatorios", async () => {
            const response = await requester.post("/api/orders").send({ customer: customerId })

            expectError(response, "MISSING_REQUIRED_FIELDS")
            expect(await Order.countDocuments()).to.equal(1)
        })

        it("Crear: La lista de items está vacía", async () => {
            const response = await requester.post("/api/orders").send({
                customer: customerId,
                deliveryAddress: "Calle Falsa 123",
                items: []
            })

            expectError(response, "MISSING_REQUIRED_FIELDS")
        })

        it("Crear: El cliente no existe", async () => {
            const response = await requester.post("/api/orders").send({
                customer: idInexistente,
                deliveryAddress: "Calle Falsa 123",
                items
            })

            expectError(response, "USER_NOT_FOUND")
            expect(await Order.countDocuments()).to.equal(1)
        })

        it("Crear: El ID del cliente es inválido", async () => {
            const response = await requester.post("/api/orders").send({
                customer: idInvalido,
                deliveryAddress: "Calle Falsa 123",
                items
            })

            expectError(response, "INVALID_ID")
        })

        it("Crear: Un item con cantidad 0 devuelve error de validación", async () => {
            const response = await requester.post("/api/orders").send({
                customer: customerId,
                deliveryAddress: "Calle Falsa 123",
                items: [{ name: "Cable USB", quantity: 0, price: 10 }]
            })

            expect(response.status).to.equal(400)
            expect(response.body).to.have.property("status", "error")
            expect(response.body.error).to.have.property("name", "ValidationError")
            expect(response.body.error).to.have.property("code", ErrorDictionary.VALIDATION_ERROR.code)
            expect(response.body.error.message).to.be.a("string").that.is.not.empty
            expect(await Order.countDocuments()).to.equal(1)
        })

        it("Crear: JSON mal formado", async () => {
            const response = await requester
                .post("/api/orders")
                .set("Content-Type", "application/json")
                .send('{"customer":')

            expectError(response, "INVALID_JSON")
        })
    })

    describe("Actualizar estado", () => {
        it("Actualizar: Estado válido", async () => {
            const response = await requester.put(`/api/orders/${orderId}`).send({ status: ORDER_STATUS.ASSIGNED })

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property("status", "success")
            expect(response.body.payload).to.have.property("_id", orderId)
            expect(response.body.payload).to.have.property("status", ORDER_STATUS.ASSIGNED)
            expect(response.body.payload).to.have.property("deliveryAddress", "Av. Siempre Viva 742")

            const inDb = await Order.findById(orderId)
            expect(inDb.status).to.equal(ORDER_STATUS.ASSIGNED)
        })

        Object.values(ORDER_STATUS).forEach((estado) => {
            it(`Actualizar: Acepta el estado "${estado}"`, async () => {
                const response = await requester.put(`/api/orders/${orderId}`).send({ status: estado })

                expect(response.status).to.equal(200)
                expect(response.body.payload).to.have.property("status", estado)
            })
        })

        it("Actualizar: Estado inválido", async () => {
            const response = await requester.put(`/api/orders/${orderId}`).send({ status: "estado_inexistente" })

            expectError(response, "INVALID_STATUS")

            // El pedido no cambió
            const inDb = await Order.findById(orderId)
            expect(inDb.status).to.equal(ORDER_STATUS.CREATED)
        })

        it("Actualizar: ID inválido", async () => {
            const response = await requester.put(`/api/orders/${idInvalido}`).send({ status: ORDER_STATUS.ASSIGNED })

            expectError(response, "INVALID_ID")
        })

        it("Actualizar: Pedido no encontrado", async () => {
            const response = await requester.put(`/api/orders/${idInexistente}`).send({ status: ORDER_STATUS.ASSIGNED })

            expectError(response, "ORDER_NOT_FOUND")
        })

        it("Actualizar: JSON mal formado", async () => {
            const response = await requester
                .put(`/api/orders/${orderId}`)
                .set("Content-Type", "application/json")
                .send('{"status":')

            expectError(response, "INVALID_JSON")
        })
    })

    describe("Eliminar", () => {
        it("Eliminar: Pedido eliminado", async () => {
            const response = await requester.delete(`/api/orders/${orderId}`)

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property("status", "success")
            expect(response.body.payload).to.have.property("_id", orderId)

            expect(await Order.findById(orderId)).to.be.null
        })

        it("Eliminar: ID inválido", async () => {
            const response = await requester.delete(`/api/orders/${idInvalido}`)

            expectError(response, "INVALID_ID")
        })

        it("Eliminar: Pedido no encontrado", async () => {
            const response = await requester.delete(`/api/orders/${idInexistente}`)

            expectError(response, "ORDER_NOT_FOUND")
        })
    })
})