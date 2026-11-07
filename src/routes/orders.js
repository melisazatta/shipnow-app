
import { Router } from "express"
import OrderController from "../controllers/order.controller.js"

const orderController = new OrderController()
const router = Router()


/**
 * @openapi
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       required:
 *         - name
 *         - quantity
 *         - price
 *       properties:
 *         name:
 *           type: string
 *           example: Caja chica
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *         price:
 *           type: number
 *           minimum: 0
 *           example: 50
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 6ad6b1eb0f2bce6b04fb40aa
 *         customer:
 *           type: string
 *           description: ID del cliente
 *           example: 6ad6b1eb0f2bce6b04fb30db
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         deliveryAddress:
 *           type: string
 *           example: Av. Pellegrini 1500, Rosario
 *         declaredValue:
 *           type: number
 *           description: Suma de quantity x price de los items
 *           example: 100
 *         shippingCost:
 *           type: number
 *           description: 10 en desarrollo; 50 + 1% del valor declarado en producción
 *           example: 10
 *         total:
 *           type: number
 *           description: declaredValue + shippingCost
 *           example: 110
 *         status:
 *           type: string
 *           enum: [created, assigned, picked_up, in_transit, delivered, cancelled]
 *           example: created
 *         priority:
 *           type: string
 *           enum: [low, normal, high]
 *           example: normal
 *         delivery:
 *           type: string
 *           nullable: true
 *           description: ID de la entrega asociada; es null hasta que se asigna una
 *           example: null
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
 *     OrderDetail:
 *       type: object
 *       description: >
 *         Pedido tal como lo devuelven los GET: con los datos básicos del
 *         cliente y la entrega asociada (si existe) en lugar de sus IDs.
 *       properties:
 *         _id:
 *           type: string
 *           example: 6aee88510cf45faf6db8484b
 *         customer:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: 6aeadef8eff017f303961a29
 *             firstName:
 *               type: string
 *               example: James
 *             lastName:
 *               type: string
 *               example: Howe
 *             email:
 *               type: string
 *               example: jedidiah49@hotmail.com
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         deliveryAddress:
 *           type: string
 *           example: Av. Pellegrini 1500, Rosario
 *         declaredValue:
 *           type: number
 *           example: 100
 *         shippingCost:
 *           type: number
 *           example: 10
 *         total:
 *           type: number
 *           example: 110
 *         status:
 *           type: string
 *           enum: [created, assigned, picked_up, in_transit, delivered, cancelled]
 *           example: assigned
 *         priority:
 *           type: string
 *           enum: [low, normal, high]
 *           example: high
 *         delivery:
 *           type: object
 *           nullable: true
 *           description: Entrega asociada; null si todavía no tiene una
 *           properties:
 *             _id:
 *               type: string
 *               example: 6aeadef9eff017f303961a48
 *             order:
 *               type: string
 *               example: 6aee88510cf45faf6db8484b
 *             driver:
 *               type: string
 *               nullable: true
 *               example: 6aeadef8eff017f303961a28
 *             status:
 *               type: string
 *               enum: [pending, assigned, in_transit, delivered]
 *               example: assigned
 *             priority:
 *               type: string
 *               enum: [low, normal, high]
 *               example: high
 *             assignedAt:
 *               type: string
 *               format: date-time
 *               nullable: true
 *               example: "2026-10-29T21:08:29.027Z"
 *             deliveredAt:
 *               type: string
 *               format: date-time
 *               nullable: true
 *               example: null
 *             createdAt:
 *               type: string
 *               format: date-time
 *               example: "2026-11-04T07:30:01.457Z"
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               example: "2026-11-04T07:30:01.457Z"
 *             __v:
 *               type: integer
 *               example: 0
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-11-04T07:30:01.169Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-11-04T07:30:01.654Z"
 *         __v:
 *           type: integer
 *           example: 0
 */

/**
 * @openapi
 * /api/orders:
 *   get:
 *     summary: Obtener todos los pedidos
 *     description: Devuelve todos los pedidos, con los datos básicos del cliente y de la entrega asociada.
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Lista de pedidos
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
 *                   example: Ordenes obtenidas exitosamente
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderDetail'
 */
router.get('/', orderController.getAll)

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     summary: Obtener un pedido por ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6ad6b1eb0f2bce6b04fb40aa
 *         description: ID del pedido
 *     responses:
 *       200:
 *         description: Pedido encontrado
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
 *                   example: Orden obtenida exitosamente
 *                 payload:
 *                   $ref: '#/components/schemas/OrderDetail'
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
 *         description: Pedido no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: OrderNotFound
 *                 code: 4
 *                 message: Pedido no encontrado
 */
router.get('/:id', orderController.getOrderById)

/**
 * @openapi
 * /api/orders:
 *   post:
 *     summary: Crear un pedido
 *     description: >
 *       El pedido siempre se crea con estado `created`. El valor declarado,
 *       el costo de envío y el total los calcula el servidor a partir de los
 *       items, por lo que no hace falta enviarlos. Si no se indica
 *       `priority`, se usa `normal`.
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer
 *               - deliveryAddress
 *               - items
 *             properties:
 *               customer:
 *                 type: string
 *                 description: ID de un usuario existente
 *                 example: 6ad6b1eb0f2bce6b04fb30db
 *               deliveryAddress:
 *                 type: string
 *                 example: Av. Pellegrini 1500, Rosario
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   $ref: '#/components/schemas/OrderItem'
 *               priority:
 *                 type: string
 *                 enum: [low, normal, high]
 *                 example: normal
 *     responses:
 *       201:
 *         description: Pedido creado
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
 *                   example: Orden creada exitosamente
 *                 payload:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Faltan campos, ID de cliente inválido, datos inválidos o JSON mal formado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               MissingRequiredFields:
 *                 summary: Faltan campos obligatorios o items no es una lista con al menos un elemento
 *                 value:
 *                   status: error
 *                   error:
 *                     name: MissingRequiredFields
 *                     code: 6
 *                     message: Falta información requerida.
 *               InvalidId:
 *                 summary: El ID del cliente no tiene formato válido
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
 *                     message: La cantidad mínima es 1
 *               InvalidJson:
 *                 summary: JSON mal formado
 *                 value:
 *                   status: error
 *                   error:
 *                     name: InvalidJson
 *                     code: 2
 *                     message: El cuerpo de la petición no es un JSON válido
 *       404:
 *         description: El cliente indicado no existe
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
router.post('/', orderController.create)

/**
 * @openapi
 * /api/orders/{id}:
 *   put:
 *     summary: Actualizar un pedido
 *     description: >
 *       Permite cambiar el estado, la prioridad y la dirección de entrega.
 *       Los estados válidos son `created`, `assigned`, `picked_up`,
 *       `in_transit`, `delivered` y `cancelled`.
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6ad6b1eb0f2bce6b04fb40aa
 *         description: ID del pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [created, assigned, picked_up, in_transit, delivered, cancelled]
 *                 example: in_transit
 *               priority:
 *                 type: string
 *                 enum: [low, normal, high]
 *                 example: high
 *               deliveryAddress:
 *                 type: string
 *                 example: Córdoba 2300, Rosario
 *     responses:
 *       200:
 *         description: Pedido actualizado
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
 *                   example: Orden actualizada exitosamente
 *                 payload:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: ID inválido, estado inválido, datos inválidos o JSON mal formado
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
 *               InvalidStatus:
 *                 summary: Estado de pedido inexistente
 *                 value:
 *                   status: error
 *                   error:
 *                     name: InvalidStatus
 *                     code: 2
 *                     message: Estado de pedido invalido
 *               ValidationError:
 *                 summary: Prioridad inválida u otro dato que no cumple el esquema
 *                 value:
 *                   status: error
 *                   error:
 *                     name: ValidationError
 *                     code: 6
 *                     message: "`volando` is not a valid enum value for path `priority`."
 *               InvalidJson:
 *                 summary: JSON mal formado
 *                 value:
 *                   status: error
 *                   error:
 *                     name: InvalidJson
 *                     code: 2
 *                     message: El cuerpo de la petición no es un JSON válido
 *       404:
 *         description: Pedido no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: OrderNotFound
 *                 code: 4
 *                 message: Pedido no encontrado
 */
router.put('/:id', orderController.update)

/**
 * @openapi
 * /api/orders/{id}:
 *   delete:
 *     summary: Eliminar un pedido
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6ad6b1eb0f2bce6b04fb40aa
 *         description: ID del pedido
 *     responses:
 *       200:
 *         description: Pedido eliminado
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
 *                   example: Orden borrada exitosamente
 *                 payload:
 *                   $ref: '#/components/schemas/Order'
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
 *         description: Pedido no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: OrderNotFound
 *                 code: 4
 *                 message: Pedido no encontrado
 */
router.delete('/:id', orderController.delete)

export default router