
import { Router } from "express";
import DeliveryController from "../controllers/delivery.controller.js";

import { uploadProof } from "../middlewares/uploadMiddleware.js";
 
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
 *         proofs:
 *           type: array
 *           description: Metadatos de los comprobantes de entrega (el archivo queda en el servidor)
 *           items:
 *             $ref: '#/components/schemas/DeliveryProof'
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
 *     DeliveryProof:
 *       type: object
 *       properties:
 *         originalName:
 *           type: string
 *           description: Nombre original del archivo
 *           example: comprobante-firmado.pdf
 *         fileName:
 *           type: string
 *           description: Nombre generado al guardarlo en el servidor
 *           example: 1794449765149-586089037.pdf
 *         path:
 *           type: string
 *           description: Ruta del archivo en el servidor
 *           example: uploads/proofs/1794449765149-586089037.pdf
 *         mimeType:
 *           type: string
 *           example: application/pdf
 *         size:
 *           type: integer
 *           description: Tamaño en bytes
 *           example: 48213
 *         type:
 *           type: string
 *           enum: [delivery_proof]
 *           example: delivery_proof
 *         uploadedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-11-12T15:20:11.391Z"
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

/**
 * @openapi
 * /api/deliveries/{id}/proof:
 *   post:
 *     summary: Subir el comprobante de entrega
 *     description: >
 *       Recibe un archivo como `multipart/form-data` en el campo `proof`, lo
 *       guarda en el servidor (`uploads/proofs`) y registra sus metadatos en la
 *       entrega. Formatos aceptados: PDF, JPG y PNG. Tamaño máximo: 5 MB.
 *       Solo se guardan los metadatos en la base, nunca el archivo.
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6aeadef9eff017f303961a4a
 *         description: ID de la entrega
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [proof]
 *             properties:
 *               proof:
 *                 type: string
 *                 format: binary
 *                 description: Archivo del comprobante (PDF, JPG o PNG, máximo 5 MB)
 *     responses:
 *       200:
 *         description: Comprobante subido. Devuelve la entrega actualizada.
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
 *                   example: Comprobante subido exitosamente
 *                 payload:
 *                   $ref: '#/components/schemas/Delivery'
 *       400:
 *         description: >
 *           No se envió el archivo (`FileRequired`), el campo del archivo no es
 *           `proof` (`UnexpectedFileField`) o el ID no es válido (`InvalidId`).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: FileRequired
 *                 code: 6
 *                 message: Se requiere un archivo
 *       404:
 *         description: Entrega no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: DeliveryNotFound
 *                 code: 4
 *                 message: Entrega no encontrada
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
router.post("/:id/proof", uploadProof.single("proof"), deliveryController.uploadProof);

export default router;