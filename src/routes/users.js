import { Router } from "express"
import UserController from "../controllers/user.controller.js"
import { uploadDocument } from "../middlewares/uploadMiddleware.js"
 
const userController = new UserController()
const router = Router()
 

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 6ad6b1eb0f2bce6b04fb30db
 *         firstName:
 *           type: string
 *           example: Juan
 *         lastName:
 *           type: string
 *           example: Lopez
 *         email:
 *           type: string
 *           example: juan_lopez33@gmail.com
 *         role:
 *           type: string
 *           enum: [admin, user, customer, driver, store]
 *           example: customer
 *         isAvailable:
 *           type: boolean
 *           example: true
 *         documents:
 *           type: array
 *           description: Metadatos de los documentos cargados (el archivo queda en el servidor)
 *           items:
 *             $ref: '#/components/schemas/UserDocument'
 *           example: []
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-10-20T00:12:27.808Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-10-20T00:12:27.808Z"
 *         __v:
 *           type: integer
 *           example: 0
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: error
 *         error:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             code:
 *               type: integer
 *             message:
 *               type: string
 */
 
/**
 * @openapi
 * components:
 *   schemas:
 *     UserDocument:
 *       type: object
 *       properties:
 *         originalName:
 *           type: string
 *           description: Nombre original del archivo
 *           example: dni.pdf
 *         fileName:
 *           type: string
 *           description: Nombre generado al guardarlo en el servidor
 *           example: 1794447402737-718501861.pdf
 *         path:
 *           type: string
 *           description: Ruta del archivo en el servidor
 *           example: uploads/documents/1794447402737-718501861.pdf
 *         mimeType:
 *           type: string
 *           example: application/pdf
 *         size:
 *           type: integer
 *           description: Tamaño en bytes
 *           example: 48213
 *         type:
 *           type: string
 *           description: Tipo de documento
 *           enum: [driver_license, user_document]
 *           example: user_document
 *         uploadedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-11-12T15:20:11.391Z"
 */
 
/**
 * @openapi
 * /api/users/{id}/documents:
 *   post:
 *     summary: Subir un documento de usuario
 *     description: >
 *       Recibe un archivo como `multipart/form-data` en el campo `document`, lo
 *       guarda en el servidor (`uploads/documents`) y registra sus metadatos en
 *       el usuario. Formatos aceptados: PDF, JPG y PNG. Tamaño máximo: 5 MB.
 *       Solo se guardan los metadatos en la base, nunca el archivo. La licencia
 *       de conducir (`driver_license`) solo la puede subir un usuario con rol
 *       `driver`.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6ad6b1eb0f2bce6b04fb30aa
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [document]
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: Archivo del documento (PDF, JPG o PNG, máximo 5 MB)
 *               type:
 *                 type: string
 *                 enum: [driver_license, user_document]
 *                 default: user_document
 *                 description: Tipo de documento. Si no se envía, se toma `user_document`.
 *     responses:
 *       200:
 *         description: Documento subido. Devuelve el usuario actualizado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Documento subido exitosamente
 *                 payload:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: >
 *           No se envió el archivo (`FileRequired`), el tipo de documento no es
 *           válido (`InvalidDocumentType`), el campo del archivo no es
 *           `document` (`UnexpectedFileField`) o el ID no es válido
 *           (`InvalidId`).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: InvalidDocumentType
 *                 code: 6
 *                 message: Tipo de documento inválido
 *       403:
 *         description: Un usuario que no es driver no puede subir una licencia de conducir
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: DocumentNotAllowed
 *                 code: 6
 *                 message: Este usuario no puede subir ese tipo de documento
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: UserNotFound
 *                 code: 4
 *                 message: Usuario no encontrado
 *       413:
 *         description: El archivo supera el tamaño máximo permitido (5 MB)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: FileTooLarge
 *                 code: 6
 *                 message: El archivo supera el tamaño máximo permitido (5 MB)
 *       415:
 *         description: Tipo de archivo no permitido (solo PDF, JPG y PNG)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: InvalidFileType
 *                 code: 2
 *                 message: "Tipo de archivo no permitido. Formatos aceptados: PDF, JPG y PNG"
 *       500:
 *         description: Error al guardar el archivo en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: FileSaveError
 *                 code: 8
 *                 message: Error al guardar el archivo en el servidor
 */
router.post("/:id/documents", uploadDocument.single("document"), userController.uploadDocument)

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Usuarios obtenidos exitosamente
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
router.get('/', userController.getAll)
 
 
/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6ad6b1eb0f2bce6b04fb30db
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Usuario obtenido exitosamente
 *                 payload:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: El ID recibido no es válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: InvalidId
 *                 code: 2
 *                 message: El ID recibido no es válido
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: UserNotFound
 *                 code: 4
 *                 message: Usuario no encontrado
 */
router.get('/:id', userController.getUserById)
 
/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Crear un usuario
 *     description: El usuario siempre se crea con rol `customer`; el campo `role` del body se ignora.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Juan
 *               lastName:
 *                 type: string
 *                 example: Lopez
 *               email:
 *                 type: string
 *                 example: juan_lopez@gmail.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Usuario creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Usuario creado exitosamente
 *                 payload:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Faltan campos obligatorios o el cuerpo de la petición tiene un JSON mal formado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               MissingRequiredFields:
 *                 summary: Faltan campos obligatorios
 *                 value:
 *                   status: error
 *                   error:
 *                     name: MissingRequiredFields
 *                     code: 6
 *                     message: Falta información requerida.
 *               InvalidJson:
 *                 summary: JSON mal formado
 *                 value:
 *                   status: error
 *                   error:
 *                     name: InvalidJson
 *                     code: 2
 *                     message: El cuerpo de la petición no es un JSON válido
 *       409:
 *         description: Ya existe un usuario con ese email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: UserAlreadyExists
 *                 code: 5
 *                 message: Ya existe un usuario
 */
router.post('/', userController.create)
 
/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar un usuario
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6ad6b1eb0f2bce6b04fb30db
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Juan
 *               lastName:
 *                 type: string
 *                 example: Perez
 *               email:
 *                 type: string
 *                 example: juan_perez@gmail.com
 *               isAvailable:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Usuario actualizado exitosamente
 *                 payload:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: ID inválido, datos inválidos o JSON mal formado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               InvalidId:
 *                 summary: ID inválido
 *                 value:
 *                   status: error
 *                   error:
 *                     name: InvalidId
 *                     code: 2
 *                     message: El ID recibido no es válido
 *               ValidationError:
 *                 summary: Datos inválidos (el mensaje depende del campo)
 *                 value:
 *                   status: error
 *                   error:
 *                     name: ValidationError
 *                     code: 6
 *                     message: El nombre es obligatorio
 *               InvalidJson:
 *                 summary: JSON mal formado
 *                 value:
 *                   status: error
 *                   error:
 *                     name: InvalidJson
 *                     code: 2
 *                     message: El cuerpo de la petición no es un JSON válido
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: UserNotFound
 *                 code: 4
 *                 message: Usuario no encontrado
 *       409:
 *         description: Ya existe un usuario con ese email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: DuplicateKey
 *                 code: 5
 *                 message: Ya existe un registro con ese valor
 */
router.put('/:id', userController.update)
 
/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar un usuario
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6ad6b1eb0f2bce6b04fb30db
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Usuario borrado exitosamente
 *                 payload:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: El ID recibido no es válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: InvalidId
 *                 code: 2
 *                 message: El ID recibido no es válido
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: UserNotFound
 *                 code: 4
 *                 message: Usuario no encontrado
 */
router.delete('/:id', userController.delete)
 
export default router