// import { Router } from "express";
// import ProductController from "../controllers/product.controller.js";

// const router = Router();
// const productController = new ProductController();

// router.get("/", productController.getAll);

// router.get("/:id", productController.getById);

// router.post("/", productController.create);

// router.put("/:id", productController.update);

// router.delete("/:id", productController.delete);

// export default router;




import { Router } from "express";
import ProductController from "../controllers/product.controller.js";
 
const router = Router();
const productController = new ProductController();
 
/**
 * @openapi
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 6ad6b1eb0f2bce6b04fb30aa
 *         name:
 *           type: string
 *           example: Auriculares inalámbricos
 *         description:
 *           type: string
 *           example: Auriculares bluetooth con cancelación de ruido
 *         price:
 *           type: number
 *           minimum: 0
 *           example: 49.99
 *         stock:
 *           type: integer
 *           minimum: 0
 *           example: 25
 *         status:
 *           type: string
 *           description: Se calcula según el stock (available si stock > 0, out_of_stock si es 0)
 *           enum: [available, out_of_stock]
 *           example: available
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
 */
 
/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Obtener todos los productos
 *     description: >
 *       Devuelve la lista de productos. Los parámetros de query se usan como
 *       filtro (por ejemplo `?status=available`).
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lista de productos
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
 *                     $ref: '#/components/schemas/Product'
 */
router.get("/", productController.getAll);
 
/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Obtener un producto por ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6ad6b1eb0f2bce6b04fb30aa
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 payload:
 *                   $ref: '#/components/schemas/Product'
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
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: ProductNotFound
 *                 code: 4
 *                 message: Producto no encontrado
 */
router.get("/:id", productController.getById);
 
/**
 * @openapi
 * /api/products:
 *   post:
 *     summary: Crear un producto
 *     description: >
 *       `name`, `price` y `stock` son obligatorios. `price` y `stock` deben ser
 *       números mayores o iguales a 0. El campo `status` se calcula solo a
 *       partir del stock. La descripción es obligatoria en el modelo: si falta,
 *       se devuelve un error de validación.
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, price, stock]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 minimum: 0
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *           example:
 *             name: Auriculares inalámbricos
 *             description: Auriculares bluetooth con cancelación de ruido
 *             price: 49.99
 *             stock: 25
 *     responses:
 *       201:
 *         description: Producto creado
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
 *                   example: Producto creado correctamente.
 *                 payload:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: >
 *           Datos inválidos. Puede ser `MissingRequiredFields` (falta name,
 *           price o stock), `InvalidPrice` (precio negativo o no numérico),
 *           `InvalidStock` (stock negativo o no numérico) o `ValidationError`
 *           (por ejemplo, falta la descripción).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: InvalidPrice
 *                 code: 6
 *                 message: El precio debe ser un número mayor o igual a 0.
 */
router.post("/", productController.create);
 
/**
 * @openapi
 * /api/products/{id}:
 *   put:
 *     summary: Actualizar un producto
 *     description: >
 *       Todos los campos son opcionales. Si se envía `stock`, el `status` se
 *       recalcula automáticamente.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6ad6b1eb0f2bce6b04fb30aa
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 minimum: 0
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *           example:
 *             price: 39.99
 *             stock: 0
 *     responses:
 *       200:
 *         description: Producto actualizado
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
 *                   example: Producto actualizado correctamente.
 *                 payload:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: >
 *           ID inválido (`InvalidId`), precio inválido (`InvalidPrice`) o stock
 *           inválido (`InvalidStock`).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: InvalidStock
 *                 code: 6
 *                 message: El stock debe ser un número mayor o igual a 0.
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: ProductNotFound
 *                 code: 4
 *                 message: Producto no encontrado
 */
router.put("/:id", productController.update);
 
/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     summary: Eliminar un producto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6ad6b1eb0f2bce6b04fb30aa
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto eliminado
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
 *                   example: Producto eliminado correctamente.
 *                 payload:
 *                   $ref: '#/components/schemas/Product'
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
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: ProductNotFound
 *                 code: 4
 *                 message: Producto no encontrado
 */
router.delete("/:id", productController.delete);
 
export default router;