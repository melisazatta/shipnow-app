import express from 'express'
import usersRouter from './routes/users.js'
import productsRouter from './routes/products.js'
import ordersRouter from './routes/orders.js'
import deliveriesRouter from './routes/deliveries.js'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true}))

app.use("/api/users", usersRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/deliveries", deliveriesRouter);

export default app