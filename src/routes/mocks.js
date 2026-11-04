import mockController from "../controllers/mock.controller.js"
import { Router } from "express"

const router = Router()

// Generación de datos sin guardar en MongoDB

router.get("/users", mockController.getUsers)
// router.post("/users", mockController.seedUsers)

router.get("/drivers", mockController.getDrivers)
router.get("/orders", mockController.getOrders)
router.get("/deliveries", mockController.getDeliveries)

// Inserción de datos en MongoDB
router.post("/seed", mockController.seed);

export default router