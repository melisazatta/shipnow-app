import { Router } from "express"
import OrderController from "../controllers/order.controller.js"

const orderController = new OrderController()
const router = Router()

router.get('/', orderController.getAll)

router.get('/:id', orderController.getOrderById)

router.post('/', orderController.create)

router.put('/:id', orderController.update)

router.delete('/:id', orderController.delete)

export default router