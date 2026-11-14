import { expect } from "chai"
import supertest from "supertest"
import mongoose from "mongoose"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"

import app from "../src/app.js"
import User from "../src/models/user.model.js"
import Order from "../src/models/order.model.js"
import Delivery from "../src/models/delivery.model.js"
import { UPLOAD_FOLDERS } from "../src/middlewares/uploadMiddleware.js"
import { ErrorDictionary } from "../src/utils/errors.js"
import { USER_ROLES, DOCUMENT_TYPES, PROOF_TYPES, UPLOAD_CONFIG } from "../src/constants/index.js"

dotenv.config({ quiet: true })

const requester = supertest(app)

const idInvalido = "123abc"
const idInexistente = new mongoose.Types.ObjectId().toString()

// Archivos de prueba en memoria: no dependen de ningún archivo del disco
const pdf = Buffer.from("%PDF-1.4 archivo de prueba")
const PDF = { filename: "dni.pdf", contentType: "application/pdf" }

// Campos que se guardan en la base: solo metadatos, nunca el archivo
const METADATA_KEYS = ["originalName", "fileName", "path", "mimeType", "size", "type", "uploadedAt"]

let customerId = ""
let driverId = ""
let deliveryId = ""
let createdFiles = []

const cleanDb = () =>
    Promise.all([Delivery.deleteMany({}), Order.deleteMany({}), User.deleteMany({})])

// Lista de archivos que hay en una carpeta de uploads
const filesIn = (folder) => (fs.existsSync(folder) ? fs.readdirSync(folder).sort() : [])

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

// Valida los metadatos de un archivo guardado y registra el archivo para borrarlo al terminar
const expectStoredFile = (meta, { originalName, folder, type, size }) => {
    createdFiles.push(meta.path)

    expect(meta).to.have.all.keys(...METADATA_KEYS)
    expect(meta).to.have.property("originalName", originalName)
    expect(meta.fileName).to.be.a("string").that.is.not.empty
    expect(meta.fileName).to.not.equal(originalName) // el nombre en disco lo genera el servidor
    expect(path.normalize(path.dirname(meta.path))).to.equal(path.normalize(folder))
    expect(meta).to.have.property("mimeType", "application/pdf")
    expect(meta).to.have.property("size", size)
    expect(meta).to.have.property("type", type)
    expect(new Date(meta.uploadedAt).toString()).to.not.equal("Invalid Date")

    // El archivo quedó en el servidor
    expect(fs.existsSync(meta.path)).to.equal(true)
}

describe("Test de endpoints de carga de archivos", function () {
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

    // Cada test arranca con datos propios y sin archivos de otros tests
    beforeEach(async () => {
        await cleanDb()
        createdFiles = []

        const customer = await User.create({
            firstName: "Maria",
            lastName: "Lopez",
            email: "maria_lopez@gmail.com",
            password: "123456"
        })
        const driver = await User.create({
            firstName: "Carlos",
            lastName: "Ruiz",
            email: "carlos_ruiz@gmail.com",
            password: "123456",
            role: USER_ROLES.DRIVER
        })
        customerId = String(customer._id)
        driverId = String(driver._id)

        const order = await Order.create({
            customer: customerId,
            deliveryAddress: "Av. Siempre Viva 742",
            items: [{ name: "Auriculares", quantity: 1, price: 50 }],
            declaredValue: 50,
            shippingCost: 10,
            total: 60
        })
        const delivery = await Delivery.create({ order: order._id, driver: driverId })
        deliveryId = String(delivery._id)
    })

    // Limpieza de los archivos que generó el test
    afterEach(() => {
        createdFiles.forEach((file) => fs.rmSync(file, { force: true }))
    })

    after(async () => {
        await cleanDb()
        await mongoose.disconnect()
    })

    describe("POST /api/users/:id/documents (documentos de usuario)", () => {
        it("Documento: Carga correcta, guarda el archivo y registra solo los metadatos", async () => {
            const response = await requester
                .post(`/api/users/${customerId}/documents`)
                .field("type", DOCUMENT_TYPES.USER_DOCUMENT)
                .attach("document", pdf, PDF)

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property("status", "success")
            expect(response.body).to.have.property("message", "Documento subido exitosamente")
            expect(response.body.payload).to.have.property("_id", customerId)
            expect(response.body.payload).to.not.have.property("password")
            expect(response.body.payload.documents).to.be.an("array").with.lengthOf(1)

            expectStoredFile(response.body.payload.documents[0], {
                originalName: "dni.pdf",
                folder: UPLOAD_FOLDERS.DOCUMENTS,
                type: DOCUMENT_TYPES.USER_DOCUMENT,
                size: pdf.length
            })

            // Lo que quedó en la base: los mismos metadatos asociados al usuario
            const inDb = await User.findById(customerId).lean()
            expect(inDb.documents).to.have.lengthOf(1)
            expect(inDb.documents[0]).to.include({ originalName: "dni.pdf", type: DOCUMENT_TYPES.USER_DOCUMENT })
        })

        it("Documento: Un driver puede subir su licencia de conducir", async () => {
            const response = await requester
                .post(`/api/users/${driverId}/documents`)
                .field("type", DOCUMENT_TYPES.DRIVER_LICENSE)
                .attach("document", pdf, { filename: "licencia.pdf", contentType: "application/pdf" })

            expect(response.status).to.equal(200)
            expect(response.body.payload.documents).to.have.lengthOf(1)
            expectStoredFile(response.body.payload.documents[0], {
                originalName: "licencia.pdf",
                folder: UPLOAD_FOLDERS.DOCUMENTS,
                type: DOCUMENT_TYPES.DRIVER_LICENSE,
                size: pdf.length
            })
        })

        it("Documento: Falta el archivo", async () => {
            const response = await requester
                .post(`/api/users/${customerId}/documents`)
                .field("type", DOCUMENT_TYPES.USER_DOCUMENT)

            expectError(response, "FILE_REQUIRED")

            const inDb = await User.findById(customerId).lean()
            expect(inDb.documents).to.be.an("array").that.is.empty
        })

        it("Documento: Tipo de documento inválido y no deja el archivo en el servidor", async () => {
            const before = filesIn(UPLOAD_FOLDERS.DOCUMENTS)

            const response = await requester
                .post(`/api/users/${customerId}/documents`)
                .field("type", "pasaporte")
                .attach("document", pdf, PDF)

            expectError(response, "INVALID_DOCUMENT_TYPE")
            expect(filesIn(UPLOAD_FOLDERS.DOCUMENTS)).to.deep.equal(before)

            const inDb = await User.findById(customerId).lean()
            expect(inDb.documents).to.be.an("array").that.is.empty
        })

        it("Documento: El usuario no existe y no deja el archivo en el servidor", async () => {
            const before = filesIn(UPLOAD_FOLDERS.DOCUMENTS)

            const response = await requester
                .post(`/api/users/${idInexistente}/documents`)
                .field("type", DOCUMENT_TYPES.USER_DOCUMENT)
                .attach("document", pdf, PDF)

            expectError(response, "USER_NOT_FOUND")
            expect(filesIn(UPLOAD_FOLDERS.DOCUMENTS)).to.deep.equal(before)
        })

        it("Documento: Un usuario que no es driver no puede subir una licencia", async () => {
            const before = filesIn(UPLOAD_FOLDERS.DOCUMENTS)

            const response = await requester
                .post(`/api/users/${customerId}/documents`)
                .field("type", DOCUMENT_TYPES.DRIVER_LICENSE)
                .attach("document", pdf, PDF)

            expectError(response, "DOCUMENT_NOT_ALLOWED")
            expect(filesIn(UPLOAD_FOLDERS.DOCUMENTS)).to.deep.equal(before)
        })

        it("Documento: Tipo de archivo no permitido", async () => {
            const before = filesIn(UPLOAD_FOLDERS.DOCUMENTS)

            const response = await requester
                .post(`/api/users/${customerId}/documents`)
                .field("type", DOCUMENT_TYPES.USER_DOCUMENT)
                .attach("document", Buffer.from("texto plano"), { filename: "notas.txt", contentType: "text/plain" })

            expectError(response, "INVALID_FILE_TYPE")
            expect(filesIn(UPLOAD_FOLDERS.DOCUMENTS)).to.deep.equal(before)
        })

        it("Documento: El archivo supera el tamaño máximo", async function () {
            this.timeout(20000)
            const before = filesIn(UPLOAD_FOLDERS.DOCUMENTS)

            const response = await requester
                .post(`/api/users/${customerId}/documents`)
                .field("type", DOCUMENT_TYPES.USER_DOCUMENT)
                .attach("document", Buffer.alloc(UPLOAD_CONFIG.MAX_FILE_SIZE + 1), PDF)

            expectError(response, "FILE_TOO_LARGE")
            expect(filesIn(UPLOAD_FOLDERS.DOCUMENTS)).to.deep.equal(before)
        })

        it("Documento: El campo del archivo no es el esperado", async () => {
            const before = filesIn(UPLOAD_FOLDERS.DOCUMENTS)

            const response = await requester
                .post(`/api/users/${customerId}/documents`)
                .field("type", DOCUMENT_TYPES.USER_DOCUMENT)
                .attach("archivo", pdf, PDF)

            expectError(response, "UNEXPECTED_FILE_FIELD")
            expect(filesIn(UPLOAD_FOLDERS.DOCUMENTS)).to.deep.equal(before)
        })
    })

    describe("POST /api/deliveries/:id/proof (comprobantes de entrega)", () => {
        it("Comprobante: Carga correcta, asocia el archivo a la entrega y devuelve la entrega actualizada", async () => {
            const response = await requester
                .post(`/api/deliveries/${deliveryId}/proof`)
                .attach("proof", pdf, { filename: "comprobante.pdf", contentType: "application/pdf" })

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property("status", "success")
            expect(response.body).to.have.property("message", "Comprobante subido exitosamente")
            expect(response.body.payload).to.have.property("_id", deliveryId)
            // La entrega viene con su pedido y su repartidor, como en el resto de los endpoints
            expect(response.body.payload.order).to.have.property("deliveryAddress", "Av. Siempre Viva 742")
            expect(response.body.payload.driver).to.have.property("_id", driverId)
            expect(response.body.payload.proofs).to.be.an("array").with.lengthOf(1)

            expectStoredFile(response.body.payload.proofs[0], {
                originalName: "comprobante.pdf",
                folder: UPLOAD_FOLDERS.PROOFS,
                type: PROOF_TYPES.DELIVERY_PROOF,
                size: pdf.length
            })

            const inDb = await Delivery.findById(deliveryId).lean()
            expect(inDb.proofs).to.have.lengthOf(1)
            expect(inDb.proofs[0]).to.include({ originalName: "comprobante.pdf" })
        })

        it("Comprobante: Falta el archivo", async () => {
            const response = await requester.post(`/api/deliveries/${deliveryId}/proof`)

            expectError(response, "FILE_REQUIRED")

            const inDb = await Delivery.findById(deliveryId).lean()
            expect(inDb.proofs).to.be.an("array").that.is.empty
        })

        it("Comprobante: La entrega no existe y no deja el archivo en el servidor", async () => {
            const before = filesIn(UPLOAD_FOLDERS.PROOFS)

            const response = await requester
                .post(`/api/deliveries/${idInexistente}/proof`)
                .attach("proof", pdf, PDF)

            expectError(response, "DELIVERY_NOT_FOUND")
            expect(filesIn(UPLOAD_FOLDERS.PROOFS)).to.deep.equal(before)
        })

        it("Comprobante: El ID de la entrega es inválido", async () => {
            const before = filesIn(UPLOAD_FOLDERS.PROOFS)

            const response = await requester
                .post(`/api/deliveries/${idInvalido}/proof`)
                .attach("proof", pdf, PDF)

            expectError(response, "INVALID_ID")
            expect(filesIn(UPLOAD_FOLDERS.PROOFS)).to.deep.equal(before)
        })

        it("Comprobante: Tipo de archivo no permitido", async () => {
            const before = filesIn(UPLOAD_FOLDERS.PROOFS)

            const response = await requester
                .post(`/api/deliveries/${deliveryId}/proof`)
                .attach("proof", Buffer.from("texto plano"), { filename: "notas.txt", contentType: "text/plain" })

            expectError(response, "INVALID_FILE_TYPE")
            expect(filesIn(UPLOAD_FOLDERS.PROOFS)).to.deep.equal(before)
        })
    })
})