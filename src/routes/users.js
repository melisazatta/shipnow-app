import { Router } from "express"
import UserController from "../controllers/user.controller.js"
 
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
 *           items:
 *             type: object
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