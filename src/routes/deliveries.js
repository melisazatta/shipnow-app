
import { Router } from "express";
import DeliveryController from "../controllers/delivery.controller.js";

const deliveryController = new DeliveryController();
const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Delivery:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID de la entrega
 *           example: "6aeadef9eff017f303961a4a"
 *         order:
 *           description: Pedido asociado a la entrega
 *           oneOf:
 *             - type: string
 *               example: "6aeadef9eff017f303961a37"
 *             - type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "6aeadef9eff017f303961a37"
 *                 customer:
 *                   type: string
 *                   example: "6aeadef8eff017f303961a26"
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderItem'
 *                 deliveryAddress:
 *                   type: string
 *                   example: "1839 Broadway, West Alainatown"
 *                 total:
 *                   type: number
 *                   example: 944.13
 *                 status:
 *                   type: string
 *                   example: in_transit
 *                 priority:
 *                   type: string
 *                   example: high
 *         driver:
 *           description: Conductor asignado a la entrega
 *           nullable: true
 *           oneOf:
 *             - type: string
 *               example: "6aeadef8eff017f303961a2d"
 *             - type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "6aeadef8eff017f303961a2d"
 *                 firstName:
 *                   type: string
 *                   example: Makenzie
 *                 lastName:
 *                   type: string
 *                   example: Robel
 *                 email:
 *                   type: string
 *                   example: roberto30@gmail.com
 *         status:
 *           type: string
 *           example: in_transit
 *         priority:
 *           type: string
 *           example: low
 *         assignedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2026-10-31T03:43:11.391Z"
 *         deliveredAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: null
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-11-04T07:30:01.457Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-11-07T03:48:07.838Z"
 *         __v:
 *           type: integer
 *           example: 0
 */

/**
 * @openapi
 * /api/deliveries:
 *   get:
 *     summary: Obtener todas las entregas
 *     tags: [Deliveries]
 *     responses:
 *       200:
 *         description: Lista de entregas obtenida exitosamente
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
 *                     $ref: '#/components/schemas/Delivery'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", deliveryController.getAll);

/**
 * @openapi
 * /api/deliveries/{id}:
 *   get:
 *     summary: Obtener una entrega por ID
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "6aeadef9eff017f303961a4a"
 *         description: ID de la entrega
 *     responses:
 *       200:
 *         description: Entrega encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 payload:
 *                   $ref: '#/components/schemas/Delivery'
 *       400:
 *         description: El ID recibido no es válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Entrega no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", deliveryController.getById);

/**
 * @openapi
 * /api/deliveries:
 *   post:
 *     summary: Crear una entrega
 *     tags: [Deliveries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order
 *             properties:
 *               order:
 *                 type: string
 *                 description: ID del pedido asociado
 *                 example: "6aeadef9eff017f303961a37"
 *               priority:
 *                 type: string
 *                 description: Prioridad de la entrega
 *                 example: low
 *           example:
 *             order: "6aeadef9eff017f303961a37"
 *             priority: low
 *     responses:
 *       201:
 *         description: Entrega creada correctamente
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
 *                   example: Entrega creada correctamente
 *                 payload:
 *                   $ref: '#/components/schemas/Delivery'
 *       400:
 *         description: Datos inválidos o falta el pedido obligatorio
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", deliveryController.create);

/**
 * @openapi
 * /api/deliveries/{id}:
 *   put:
 *     summary: Actualizar una entrega
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "6aeadef9eff017f303961a4a"
 *         description: ID de la entrega
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               priority:
 *                 type: string
 *                 description: Nueva prioridad de la entrega
 *                 example: high
 *           example:
 *             priority: high
 *     responses:
 *       200:
 *         description: Entrega actualizada correctamente
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
 *                   example: Entrega actualizada correctamente
 *                 payload:
 *                   $ref: '#/components/schemas/Delivery'
 *       400:
 *         description: ID o datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Entrega no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id", deliveryController.update);

/**
 * @openapi
 * /api/deliveries/{id}:
 *   delete:
 *     summary: Eliminar una entrega
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "6aeadef9eff017f303961a4a"
 *         description: ID de la entrega
 *     responses:
 *       200:
 *         description: Entrega eliminada correctamente
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
 *                   example: Entrega eliminada correctamente
 *                 payload:
 *                   $ref: '#/components/schemas/Delivery'
 *       400:
 *         description: El ID recibido no es válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Entrega no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", deliveryController.delete);

export default router;