import { expect } from "chai"
import supertest from "supertest"
import mongoose from "mongoose"
import dotenv from "dotenv"

import app from "../src/app.js"
import User from "../src/models/user.model.js"
import { ErrorDictionary } from "../src/utils/errors.js"

dotenv.config({ quiet: true })

// Usa la app directamente: no hace falta levantar el servidor ni abrir un puerto
const requester = supertest(app)

const user = {
    firstName: "Jose",
    lastName: "Perez",
    email: "jose_perez@gmail.com",
    password: "123456"
}

const user2 = {
    firstName: "Maria",
    lastName: "Gomez",
    email: "maria_gomez@gmail.com",
    password: "123456"
}

let userId = ""
let user2Id = ""

const idInvalido = "123abc"
const idInexistente = new mongoose.Types.ObjectId().toString()
const jsonMalFormado = '{"firstName":"Jose","lastName":'

// Valida status HTTP + formato de error definido en utils/errors.js (name, code y message)
const expectError = (response, key) => {
    const { status, name, code, message } = ErrorDictionary[key]

    expect(response.status).to.equal(status)
    expect(response.body).to.have.property("status", "error")
    expect(response.body.error).to.have.property("name", name)
    expect(response.body.error).to.have.property("code", code)
    expect(response.body.error).to.have.property("message", message)
}

describe("Test de endpoints de user", function () {
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

    // Cada test arranca con 2 usuarios propios: no depende del orden ni de otros tests
    beforeEach(async () => {
        await User.deleteMany({})
        const created = await User.create([user, user2])
        userId = String(created[0]._id)
        user2Id = String(created[1]._id)
    })

    after(async () => {
        await User.deleteMany({})
        await mongoose.disconnect()
    })

    it("Registro: Crear un usuario", async () => {
        await User.deleteMany({})

        const response = await requester.post("/api/users").send(user)

        expect(response.status).to.equal(201)
        expect(response.body).to.have.property("status", "success")
        expect(response.body.payload).to.have.property("_id")
        expect(response.body.payload).to.have.property("firstName", "Jose")
        expect(response.body.payload).to.have.property("lastName", "Perez")
        expect(response.body.payload).to.have.property("role", "customer")
        expect(response.body.payload).to.not.have.property("password")
    })

    it("Registro: Crear un segundo usuario", async () => {
        await User.deleteMany({})
        await User.create(user)

        const response = await requester.post("/api/users").send(user2)

        expect(response.status).to.equal(201)
        expect(response.body).to.have.property("status", "success")
        expect(response.body.payload).to.have.property("_id")
        expect(response.body.payload).to.have.property("email", "maria_gomez@gmail.com")
    })

    it("Registro: Faltan campos obligatorios", async () => {
        const response = await requester.post("/api/users").send({ firstName: "Pedro", lastName: "Diaz" })

        expectError(response, "MISSING_REQUIRED_FIELDS")
    })

    it("Registro: JSON mal formado", async () => {
        const response = await requester
            .post("/api/users")
            .set("Content-Type", "application/json")
            .send(jsonMalFormado)

        expectError(response, "INVALID_JSON")
    })

    it("Registro: Un rol admin enviado en el body se ignora y se crea como customer", async () => {
        const admin = { ...user2, email: "ana_admin@gmail.com", role: "admin" }

        const response = await requester.post("/api/users").send(admin)

        expect(response.status).to.equal(201)
        expect(response.body.payload).to.have.property("role", "customer")

        const enDb = await User.findOne({ email: admin.email })
        expect(enDb).to.not.be.null
        expect(enDb.role).to.equal("customer")
    })

    it("Registro: El usuario ya existe", async () => {
        const response = await requester.post("/api/users").send(user)

        expectError(response, "USER_ALREADY_EXISTS")
    })

    it("Listar: Obtener todos los usuarios", async () => {
        const response = await requester.get("/api/users")

        expect(response.status).to.equal(200)
        expect(response.body).to.have.property("status", "success")
        expect(response.body.payload).to.be.an("array").with.lengthOf(2)

        const ids = response.body.payload.map((u) => String(u._id))
        expect(ids).to.include.members([userId, user2Id])
        response.body.payload.forEach((u) => expect(u).to.not.have.property("password"))
    })

    it("Buscar por id: Usuario encontrado", async () => {
        const response = await requester.get(`/api/users/${userId}`)

        expect(response.status).to.equal(200)
        expect(response.body).to.have.property("status", "success")
        expect(response.body.payload).to.have.property("_id", userId)
        expect(response.body.payload).to.have.property("firstName", "Jose")
        expect(response.body.payload).to.have.property("lastName", "Perez")
        expect(response.body.payload).to.have.property("email", "jose_perez@gmail.com")
        expect(response.body.payload).to.not.have.property("password")
    })

    it("Buscar por id: ID inválido", async () => {
        const response = await requester.get(`/api/users/${idInvalido}`)

        expectError(response, "INVALID_ID")
    })

    it("Buscar por id: Usuario no encontrado", async () => {
        const response = await requester.get(`/api/users/${idInexistente}`)

        expectError(response, "USER_NOT_FOUND")
    })

    it("Actualizar: Usuario actualizado", async () => {
        const response = await requester.put(`/api/users/${userId}`).send({ lastName: "Gonzalez", isAvailable: false })

        expect(response.status).to.equal(200)
        expect(response.body).to.have.property("status", "success")
        expect(response.body.payload).to.have.property("_id", userId)
        expect(response.body.payload).to.have.property("firstName", "Jose")
        expect(response.body.payload).to.have.property("lastName", "Gonzalez")
        expect(response.body.payload).to.have.property("isAvailable", false)

        const userFound = await requester.get(`/api/users/${userId}`)
        expect(userFound.body.payload).to.have.property("lastName", "Gonzalez")
    })

    it("Actualizar: ID inválido", async () => {
        const response = await requester.put(`/api/users/${idInvalido}`).send({ firstName: "Otro" })

        expectError(response, "INVALID_ID")
    })

    it("Actualizar: JSON mal formado", async () => {
        const response = await requester
            .put(`/api/users/${userId}`)
            .set("Content-Type", "application/json")
            .send(jsonMalFormado)

        expectError(response, "INVALID_JSON")
    })

    it("Actualizar: Usuario no encontrado", async () => {
        const response = await requester.put(`/api/users/${idInexistente}`).send({ firstName: "Otro" })

        expectError(response, "USER_NOT_FOUND")
    })

    it("Actualizar: Email ya registrado por otro usuario", async () => {
    const response = await requester.put(`/api/users/${userId}`).send({ email: user2.email })

    expectError(response, "DUPLICATE_KEY")
    })

    it("Eliminar: Usuario eliminado", async () => {
        const response = await requester.delete(`/api/users/${userId}`)

        expect(response.status).to.equal(200)
        expect(response.body).to.have.property("status", "success")
        expect(response.body.payload).to.have.property("_id", userId)

        expect(await User.findById(userId)).to.be.null
        expect(await User.countDocuments()).to.equal(1)
    })

    it("Eliminar: ID inválido", async () => {
        const response = await requester.delete(`/api/users/${idInvalido}`)

        expectError(response, "INVALID_ID")
    })

    it("Eliminar: Usuario no encontrado", async () => {
        const response = await requester.delete(`/api/users/${idInexistente}`)

        expectError(response, "USER_NOT_FOUND")
    })
})
