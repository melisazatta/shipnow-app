import { expect } from "chai"
import supertest from "supertest"
import mongoose from "mongoose"
import dotenv from "dotenv"

import app from "../src/app.js"
import User from "../src/models/user.model.js"
import Order from "../src/models/order.model.js"
import Delivery from "../src/models/delivery.model.js"
import { ErrorDictionary } from "../src/utils/errors.js"
import { DELIVERY_STATUS, ORDER_PRIORITY, USER_ROLES } from "../src/constants/index.js"

dotenv.config({ quiet: true })

const requester = supertest(app)

const customerData = {
    firstName: "Maria",
    lastName: "Lopez",
    email: "maria_lopez@gmail.com",
    password: "123456"
}

const driverData = {
    firstName: "Carlos",
    lastName: "Ruiz",
    email: "carlos_ruiz@gmail.com",
    password: "123456",
    role: USER_ROLES.DRIVER
}

const idInvalido = "123abc"
const idInexistente = new mongoose.Types.ObjectId().toString()

let customerId = ""
let driverId = ""
let orderId = ""
let deliveryId = ""

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

// Errores de validación de Mongoose (el mensaje lo arma Mongoose, por eso solo se verifica que exista)
const expectValidationError = (response) => {
    const { status, name, code } = ErrorDictionary.VALIDATION_ERROR

    expect(response.status).to.equal(status)
    expect(response.body).to.have.property("status", "error")
    expect(response.body.error).to.have.property("name", name)
    expect(response.body.error).to.have.property("code", code)
    expect(response.body.error.message).to.be.a("string").that.is.not.empty
}

describe("Test de endpoints de deliveries", function () {
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

    // Cada test arranca con cliente, repartidor, pedido y entrega propios: no depende del orden
    beforeEach(async () => {
        await cleanDb()

        const customer = await User.create(customerData)
        const driver = await User.create(driverData)
        customerId = String(customer._id)
        driverId = String(driver._id)

        const order = await Order.create({
            customer: customerId,
            deliveryAddress: "Av. Siempre Viva 742",
            items: [{ name: "Auriculares", quantity: 2, price: 50 }],
            declaredValue: 100,
            shippingCost: 10,
            total: 110
        })
        orderId = String(order._id)

        const delivery = await Delivery.create({
            order: orderId,
            driver: driverId,
            status: DELIVERY_STATUS.ASSIGNED,
            priority: ORDER_PRIORITY.HIGH,
            assignedAt: new Date()
        })
        deliveryId = String(delivery._id)
    })

    after(async () => {
        await cleanDb()
        await mongoose.disconnect()
    })

    describe("Listar", () => {
        it("Listar: Obtener todas las entregas con pedido y repartidor populados", async () => {
            const response = await requester.get("/api/deliveries")

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property("status", "success")
            expect(response.body.payload).to.be.an("array").with.lengthOf(1)

            const delivery = response.body.payload[0]
            expect(delivery).to.have.property("_id", deliveryId)
            expect(delivery).to.have.property("status", DELIVERY_STATUS.ASSIGNED)
            expect(delivery).to.have.property("priority", ORDER_PRIORITY.HIGH)
            expect(delivery.order).to.have.property("_id", orderId)
            expect(delivery.order).to.have.property("deliveryAddress", "Av. Siempre Viva 742")
            expect(delivery.driver).to.have.property("_id", driverId)
            expect(delivery.driver).to.have.property("firstName", "Carlos")
            expect(delivery.driver).to.have.property("email", "carlos_ruiz@gmail.com")
            expect(delivery.driver).to.not.have.property("password")
        })

        it("Listar: Devuelve un array vacío si no hay entregas", async () => {
            await Delivery.deleteMany({})

            const response = await requester.get("/api/deliveries")

            expect(response.status).to.equal(200)
            expect(response.body.payload).to.be.an("array").that.is.empty
        })
    })

    describe("Buscar por id", () => {
        it("Buscar por id: Entrega encontrada", async () => {
            const response = await requester.get(`/api/deliveries/${deliveryId}`)

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property("status", "success")
            expect(response.body.payload).to.have.property("_id", deliveryId)
            expect(response.body.payload).to.have.property("status", DELIVERY_STATUS.ASSIGNED)
            expect(response.body.payload.order).to.have.property("_id", orderId)
            expect(response.body.payload.driver).to.have.property("_id", driverId)
            expect(response.body.payload.assignedAt).to.be.a("string")
            expect(response.body.payload.deliveredAt).to.be.null
        })

        it("Buscar por id: ID inválido", async () => {
            const response = await requester.get(`/api/deliveries/${idInvalido}`)

            expectError(response, "INVALID_ID")
        })

        it("Buscar por id: Entrega no encontrada", async () => {
            const response = await requester.get(`/api/deliveries/${idInexistente}`)

            expectError(response, "DELIVERY_NOT_FOUND")
        })
    })

    describe("Crear", () => {
        it("Crear: Entrega con datos válidos y valores por defecto", async () => {
            const response = await requester.post("/api/deliveries").send({ order: orderId })

            expect(response.status).to.equal(201)
            expect(response.body).to.have.property("status", "success")
            expect(response.body).to.have.property("message", "Entrega creada correctamente")

            const created = response.body.payload
            expect(created).to.have.property("_id")
            expect(created).to.have.property("order", orderId)
            expect(created).to.have.property("status", DELIVERY_STATUS.PENDING)
            expect(created).to.have.property("priority", ORDER_PRIORITY.NORMAL)
            expect(created.driver).to.be.null
            expect(created.assignedAt).to.be.null
            expect(created.deliveredAt).to.be.null

            expect(await Delivery.countDocuments()).to.equal(2)
        })

        it("Crear: Respeta la prioridad enviada", async () => {
            const response = await requester
                .post("/api/deliveries")
                .send({ order: orderId, priority: ORDER_PRIORITY.LOW })

            expect(response.status).to.equal(201)
            expect(response.body.payload).to.have.property("priority", ORDER_PRIORITY.LOW)
        })

        it("Crear: Falta el pedido (campo obligatorio)", async () => {
            const response = await requester.post("/api/deliveries").send({ priority: ORDER_PRIORITY.LOW })

            expectError(response, "MISSING_REQUIRED_FIELDS")
            expect(await Delivery.countDocuments()).to.equal(1)
        })

        it("Crear: Estado inválido devuelve error de validación", async () => {
            const response = await requester
                .post("/api/deliveries")
                .send({ order: orderId, status: "estado_inexistente" })

            expectValidationError(response)
            expect(await Delivery.countDocuments()).to.equal(1)
        })

        it("Crear: JSON mal formado", async () => {
            const response = await requester
                .post("/api/deliveries")
                .set("Content-Type", "application/json")
                .send('{"order":')

            expectError(response, "INVALID_JSON")
        })
    })

    describe("Actualizar", () => {
        it("Actualizar: Entrega actualizada", async () => {
            const response = await requester
                .put(`/api/deliveries/${deliveryId}`)
                .send({ status: DELIVERY_STATUS.IN_TRANSIT, priority: ORDER_PRIORITY.LOW })

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property("status", "success")
            expect(response.body).to.have.property("message", "Entrega actualizada correctamente")
            expect(response.body.payload).to.have.property("_id", deliveryId)
            expect(response.body.payload).to.have.property("status", DELIVERY_STATUS.IN_TRANSIT)
            expect(response.body.payload).to.have.property("priority", ORDER_PRIORITY.LOW)

            const inDb = await Delivery.findById(deliveryId)
            expect(inDb.status).to.equal(DELIVERY_STATUS.IN_TRANSIT)
        })

        it("Actualizar: Estado inválido devuelve error de validación", async () => {
            const response = await requester
                .put(`/api/deliveries/${deliveryId}`)
                .send({ status: "estado_inexistente" })

            expectValidationError(response)

            // La entrega no cambió
            const inDb = await Delivery.findById(deliveryId)
            expect(inDb.status).to.equal(DELIVERY_STATUS.ASSIGNED)
        })

        it("Actualizar: ID inválido", async () => {
            const response = await requester
                .put(`/api/deliveries/${idInvalido}`)
                .send({ status: DELIVERY_STATUS.IN_TRANSIT })

            expectError(response, "INVALID_ID")
        })

        it("Actualizar: Entrega no encontrada", async () => {
            const response = await requester
                .put(`/api/deliveries/${idInexistente}`)
                .send({ status: DELIVERY_STATUS.IN_TRANSIT })

            expectError(response, "DELIVERY_NOT_FOUND")
        })
    })

    describe("Eliminar", () => {
        it("Eliminar: Entrega eliminada", async () => {
            const response = await requester.delete(`/api/deliveries/${deliveryId}`)

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property("status", "success")
            expect(response.body).to.have.property("message", "Entrega eliminada correctamente")
            expect(response.body.payload).to.have.property("_id", deliveryId)

            expect(await Delivery.findById(deliveryId)).to.be.null
        })

        it("Eliminar: ID inválido", async () => {
            const response = await requester.delete(`/api/deliveries/${idInvalido}`)

            expectError(response, "INVALID_ID")
        })

        it("Eliminar: Entrega no encontrada", async () => {
            const response = await requester.delete(`/api/deliveries/${idInexistente}`)

            expectError(response, "DELIVERY_NOT_FOUND")
        })
    })
})