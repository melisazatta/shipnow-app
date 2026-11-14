import express from 'express'
import usersRouter from './routes/users.js'
import productsRouter from './routes/products.js'
import ordersRouter from './routes/orders.js'
import deliveriesRouter from './routes/deliveries.js'

import mocksRouter from './routes/mocks.js'
import config from './config/config.js'
import { errorHandler } from './middlewares/errorHandler.js'
import { routeNotFoundHandle } from './middlewares/routeNotFoundHandle.js'
import { loggerHttp } from './middlewares/HttpLogger.js'
import loggerRouter from './routes/logger.js'
import swaggerUI from "swagger-ui-express"
import swaggerSpec from "./config/swagger.js"
import path from "path"

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true}))

app.use(loggerHttp)

// app.use("/uploads", express.static(path.resolve("uploads")))
app.use("/api/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec))

app.use("/api/users", usersRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/deliveries", deliveriesRouter);

app.use("/api/loggerTest", loggerRouter)

// if(config.environment == "development"){
   app.use("/api/mocks", mocksRouter) 
// }

app.use(routeNotFoundHandle)

app.use(errorHandler)


export default app