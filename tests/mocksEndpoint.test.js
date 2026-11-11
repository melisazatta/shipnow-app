import { expect } from "chai"
import supertest from "supertest"
import mongoose from "mongoose"
import dotenv from "dotenv"

import app from "../src/app.js"
import User from "../src/models/user.model.js"
import Order from "../src/models/order.model.js"
import Delivery from "../src/models/delivery.model.js"
import { ErrorDictionary } from "../src/utils/errors.js"
import { USER_ROLES, ORDER_STATUS, ORDER_PRIORITY, MOCKING_PARAMETERS } from "../src/constants/index.js"

dotenv.config({ quiet: true })

const requester = supertest(app)

const cleanDb = () =>
    Promise.all([Delivery.deleteMany({}), Order.deleteMany({}), User.deleteMany({})])

// Valida status HTTP + formato de error definido en utils/errors.js (name, code y message).
// En qty inválida el message es específico, por eso se puede pasar uno personalizado.
const expectError = (response, key, customMessage) => {
    const { status, name, code, message } = ErrorDictionary[key]

    expect(response.status).to.equal(status)
    expect(response.body).to.have.property("status", "error")
    expect(response.body.error).to.have.all.keys("name", "code", "message")
    expect(response.body.error).to.have.property("name", name)
    expect(response.body.error).to.have.property("code", code)
    expect(response.body.error).to.have.property("message", customMessage ?? message)
}

describe("Test de endpoints de mocks", function () {
    this.timeout(10000)

    before(async () => {
        await mongoose.connect(process.env.MONGODB_URI_TEST, { serverSelectionTimeoutMS: 5000 })

        // Guard: nunca borrar si la base no es de testing
        if (!mongoose.connection.name.endsWith("_test")) {
            const nombre = mongoose.connection.name
            await mongoose.disconnect()
            throw new Error(`La base "${nombre}" no es de testing. Abortando para no borrar datos.`)
        }

        await cleanDb()
    })

    after(async () => {
        await cleanDb()
        await mongoose.disconnect()
    })

    describe("GET /api/mocks/users", () => {
        it("Users: Devuelve la cantidad pedida con la estructura correcta", async () => {
            const response = await requester.get("/api/mocks/users?qty=5")

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property("status", "success")
            expect(response.body.payload).to.be.an("array").with.lengthOf(5)

            response.body.payload.forEach((user) => {
                expect(user).to.have.all.keys("firstName", "lastName", "email", "password", "role", "isAvailable")
                expect(user.email).to.be.a("string").that.includes("@")
                expect(Object.values(USER_ROLES)).to.include(user.role)
            })
        })

        it("Users: El primero es siempre customer y el segundo driver", async () => {
            const response = await requester.get("/api/mocks/users?qty=5")

            expect(response.body.payload[0]).to.have.property("role", USER_ROLES.CUSTOMER)
            expect(response.body.payload[1]).to.have.property("role", USER_ROLES.DRIVER)
            expect(response.body.payload[1]).to.have.property("isAvailable", true)
        })

        it("Users: Usa la cantidad por defecto si no se envía qty", async () => {
            const response = await requester.get("/api/mocks/users")

            expect(response.status).to.equal(200)
            expect(response.body.payload).to.have.lengthOf(MOCKING_PARAMETERS.DEFAULT)
        })

        it("Users: Acepta el máximo permitido", async () => {
            const response = await requester.get(`/api/mocks/users?qty=${MOCKING_PARAMETERS.MAX}`)

            expect(response.status).to.equal(200)
            expect(response.body.payload).to.have.lengthOf(MOCKING_PARAMETERS.MAX)
        })

        it("Users: No inserta nada en la base de datos", async () => {
            await requester.get("/api/mocks/users?qty=5")

            expect(await User.countDocuments()).to.equal(0)
        })
    })

    describe("GET /api/mocks/drivers", () => {
        it("Drivers: Devuelve solo usuarios con rol driver", async () => {
            const response = await requester.get("/api/mocks/drivers?qty=5")

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property("status", "success")
            expect(response.body.payload).to.be.an("array").that.is.not.empty
            response.body.payload.forEach((driver) => {
                expect(driver).to.have.property("role", USER_ROLES.DRIVER)
                expect(driver).to.have.property("isAvailable", true)
            })
        })
    })

    describe("GET /api/mocks/orders", () => {
        it("Orders: Devuelve pedidos con la estructura correcta", async () => {
            const response = await requester.get("/api/mocks/orders?qty=3")

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property("status", "success")
            expect(response.body.payload).to.be.an("array").with.lengthOf(3)

            response.body.payload.forEach((order) => {
                expect(order).to.have.property("_id")
                expect(order).to.have.property("customer")
                expect(order.deliveryAddress).to.be.a("string").that.is.not.empty
                expect(order.items).to.be.an("array").that.is.not.empty
                order.items.forEach((item) => {
                    expect(item).to.have.all.keys("name", "quantity", "price")
                    expect(item.quantity).to.be.at.least(1)
                    expect(item.price).to.be.at.least(0)
                })
                expect(order.total).to.be.a("number")
                expect(order.shippingCost).to.be.a("number")
                expect(Object.values(ORDER_STATUS)).to.include(order.status)
                expect(Object.values(ORDER_PRIORITY)).to.include(order.priority)
                expect(order.delivery).to.be.null
            })
        })

        it("Orders: No inserta nada en la base de datos", async () => {
            await requester.get("/api/mocks/orders?qty=3")

            expect(await Order.countDocuments()).to.equal(0)
        })
    })

    describe("GET /api/mocks/deliveries", () => {
        it("Deliveries: Devuelve entregas con la estructura correcta", async () => {
            const response = await requester.get("/api/mocks/deliveries?qty=5")

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property("status", "success")
            expect(response.body.payload).to.be.an("array")
            // Los pedidos cancelados no generan entrega, por eso puede haber menos de qty
            expect(response.body.payload.length).to.be.at.most(5)

            response.body.payload.forEach((delivery) => {
                expect(delivery).to.have.property("_id")
                expect(delivery).to.have.property("order")
                expect(delivery).to.have.property("status")
                expect(Object.values(ORDER_PRIORITY)).to.include(delivery.priority)
            })
        })
    })

    describe("qty inválida", () => {
        const recursos = ["users", "drivers", "orders", "deliveries"]

        const casos = [
            ["0", "qty debe ser mayor a 0"],
            ["-5", "qty debe ser mayor a 0"],
            ["abc", "qty debe ser un número entero"],
            ["2.5", "qty debe ser un número entero"],
            ["", "qty debe ser un número entero"],
            [String(MOCKING_PARAMETERS.MAX + 1), `El máximo de qty es ${MOCKING_PARAMETERS.MAX}`]
        ]

        recursos.forEach((recurso) => {
            casos.forEach(([qty, mensaje]) => {
                it(`${recurso}: qty="${qty}" devuelve 400 InvalidQuantity`, async () => {
                    const response = await requester.get(`/api/mocks/${recurso}?qty=${qty}`)

                    expectError(response, "INVALID_QUANTITY", mensaje)
                })
            })
        })
    })

    describe("POST /api/mocks/seed", () => {
        beforeEach(cleanDb)

        it("Seed: Inserta usuarios, pedidos y entregas en la base de testing", async () => {
            const response = await requester.post("/api/mocks/seed?qty=5")

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property("status", "success")
            expect(response.body.payload.users).to.deep.equal({ inserted: 5, collection: "users" })
            expect(response.body.payload.orders).to.deep.equal({ inserted: 5, collection: "orders" })
            expect(response.body.payload.deliveries).to.have.property("collection", "deliveries")
            expect(response.body.payload.deliveries.inserted).to.be.at.most(5)

            // Lo que informa la respuesta coincide con lo que quedó guardado
            expect(await User.countDocuments()).to.equal(5)
            expect(await Order.countDocuments()).to.equal(5)
            expect(await Delivery.countDocuments()).to.equal(response.body.payload.deliveries.inserted)
        })

        it("Seed: Guarda las contraseñas hasheadas y no en texto plano", async () => {
            await requester.post("/api/mocks/seed?qty=3")

            const users = await User.find({})
            expect(users).to.have.lengthOf(3)
            users.forEach((user) => {
                expect(user.password).to.not.equal(MOCKING_PARAMETERS.DEFAULT_PASSWORD)
                expect(user.password).to.match(/^\$2[aby]\$/) // formato bcrypt
            })
        })

        it("Seed: Cada entrega queda vinculada a su pedido", async () => {
            await requester.post("/api/mocks/seed?qty=5")

            const deliveries = await Delivery.find({})
            for (const delivery of deliveries) {
                const order = await Order.findById(delivery.order)
                expect(order, "la entrega apunta a un pedido existente").to.not.be.null
                expect(String(order.delivery)).to.equal(String(delivery._id))
            }
        })

        it("Seed: Con qty inválida devuelve 400 y no inserta nada", async () => {
            const response = await requester.post("/api/mocks/seed?qty=0")

            expectError(response, "INVALID_QUANTITY", "qty debe ser mayor a 0")
            expect(await User.countDocuments()).to.equal(0)
            expect(await Order.countDocuments()).to.equal(0)
        })

        it("Seed: Con qty no numérica devuelve 400", async () => {
            const response = await requester.post("/api/mocks/seed?qty=abc")

            expectError(response, "INVALID_QUANTITY", "qty debe ser un número entero")
        })

        it("Seed: Con qty=1 no hay drivers y devuelve 400 MockDataMissing", async () => {
            const response = await requester.post("/api/mocks/seed?qty=1")

            expectError(response, "MOCK_DATA_MISSING", "No hay usuarios driver para asignar a las entregas.")
        })
    })
})