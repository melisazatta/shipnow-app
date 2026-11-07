
import { Router } from "express";
import mockController from "../controllers/mock.controller.js";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     MockUser:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           example: Lennie
 *         lastName:
 *           type: string
 *           example: Frami
 *         email:
 *           type: string
 *           example: Alvena_Ledner12@gmail.com
 *         password:
 *           type: string
 *           example: coder123
 *         role:
 *           type: string
 *           enum: [customer, driver, admin, store]
 *           example: driver
 *         isAvailable:
 *           type: boolean
 *           example: true
 *
 *     MockOrderItem:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Practical Cotton Cheese
 *         quantity:
 *           type: integer
 *           example: 3
 *         price:
 *           type: number
 *           example: 26.14
 *
 *     MockOrder:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 6aee961567e3635356622072
 *         customer:
 *           type: string
 *           example: 6aee961567e3635356622071
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MockOrderItem'
 *         deliveryAddress:
 *           type: string
 *           example: 62702 Presley Union, Fort Lloyd
 *         total:
 *           type: number
 *           example: 633.33
 *         shippingCost:
 *           type: number
 *           example: 18.78
 *         declaredValue:
 *           type: number
 *           example: 614.55
 *         status:
 *           type: string
 *           example: in_transit
 *         priority:
 *           type: string
 *           example: normal
 *         delivery:
 *           type: string
 *           nullable: true
 *           example: null
 *
 *     MockDelivery:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 6aee962d67e363535662207a
 *         order:
 *           type: string
 *           example: 6aee962d67e3635356622078
 *         driver:
 *           type: string
 *           nullable: true
 *           example: null
 *         status:
 *           type: string
 *           example: pending
 *         priority:
 *           type: string
 *           example: low
 *         assignedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: null
 *         deliveredAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: null
 *
 *     MockSeedResult:
 *       type: object
 *       properties:
 *         users:
 *           type: object
 *           properties:
 *             inserted:
 *               type: integer
 *               example: 2
 *             collection:
 *               type: string
 *               example: users
 *         orders:
 *           type: object
 *           properties:
 *             inserted:
 *               type: integer
 *               example: 2
 *             collection:
 *               type: string
 *               example: orders
 *         deliveries:
 *           type: object
 *           properties:
 *             inserted:
 *               type: integer
 *               example: 1
 *             collection:
 *               type: string
 *               example: deliveries
 */

/**
 * @openapi
 * tags:
 *   name: Mocks
 *   description: Generación de datos simulados para pruebas
 */

/**
 * @openapi
 * /api/mocks/users:
 *   get:
 *     summary: Generar usuarios ficticios
 *     description: Genera usuarios simulados sin guardarlos en MongoDB.
 *     tags: [Mocks]
 *     parameters:
 *       - in: query
 *         name: qty
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Cantidad de usuarios a generar. Si se omite, utiliza el valor predeterminado.
 *         example: 2
 *     responses:
 *       200:
 *         description: Usuarios ficticios generados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MockUser'
 *       400:
 *         description: Cantidad solicitada inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/users", mockController.getUsers);

/**
 * @openapi
 * /api/mocks/drivers:
 *   get:
 *     summary: Generar repartidores ficticios
 *     description: Genera usuarios simulados y devuelve aquellos cuyo rol es driver. No guarda los datos en MongoDB.
 *     tags: [Mocks]
 *     parameters:
 *       - in: query
 *         name: qty
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Cantidad de usuarios a generar antes de filtrar los repartidores.
 *         example: 2
 *     responses:
 *       200:
 *         description: Repartidores ficticios generados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MockUser'
 *       400:
 *         description: Cantidad solicitada inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/drivers", mockController.getDrivers);

/**
 * @openapi
 * /api/mocks/orders:
 *   get:
 *     summary: Generar pedidos ficticios
 *     description: Genera pedidos simulados asociados a IDs de clientes ficticios, sin guardarlos en MongoDB.
 *     tags: [Mocks]
 *     parameters:
 *       - in: query
 *         name: qty
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Cantidad de pedidos a generar.
 *         example: 2
 *     responses:
 *       200:
 *         description: Pedidos ficticios generados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MockOrder'
 *       400:
 *         description: Cantidad solicitada inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/orders", mockController.getOrders);

/**
 * @openapi
 * /api/mocks/deliveries:
 *   get:
 *     summary: Generar entregas ficticias
 *     description: Genera entregas simuladas asociadas a pedidos y repartidores ficticios, sin guardarlas en MongoDB.
 *     tags: [Mocks]
 *     parameters:
 *       - in: query
 *         name: qty
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Cantidad de entregas a generar.
 *         example: 2
 *     responses:
 *       200:
 *         description: Entregas ficticias generadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MockDelivery'
 *       400:
 *         description: Cantidad solicitada inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/deliveries", mockController.getDeliveries);

/**
 * @openapi
 * /api/mocks/seed:
 *   post:
 *     summary: Insertar datos ficticios en MongoDB
 *     description: Genera e inserta usuarios, pedidos y entregas en sus respectivas colecciones.
 *     tags: [Mocks]
 *     parameters:
 *       - in: query
 *         name: qty
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Cantidad de usuarios y pedidos a generar. Si se omite, utiliza el valor predeterminado.
 *         example: 2
 *     responses:
 *       200:
 *         description: Datos ficticios insertados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 payload:
 *                   $ref: '#/components/schemas/MockSeedResult'
 *       400:
 *         description: Cantidad inválida o faltan datos para generar pedidos o entregas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error durante la inserción de datos en MongoDB
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/seed", mockController.seed);

export default router;

