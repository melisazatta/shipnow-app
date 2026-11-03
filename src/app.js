import express from 'express'
// import mongoose from 'mongoose'
import usersRouter from './routes/users.js'
import productsRouter from './routes/products.js'
import ordersRouter from './routes/orders.js'
import deliveriesRouter from './routes/deliveries.js'
// import { config } from 'dotenv'

const app = express()

// const PORT = config.port
// const MONGODB_URI = config.mongoUri
// const JWT_SECRET = config.jwtSecret

app.use(express.json())
app.use(express.urlencoded({ extended: true}))


app.use("/api/users", usersRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/deliveries", deliveriesRouter);

// mongoose.connect(MONGODB_URI)
// .then(()=> {
//     app.listen(PORT, () => {
//       console.log('Servidor corriendo en puerto: ' + PORT)  
//     })
// })
// .catch((error) => {
//     console.log('Error de conexión', error)
// })
export default app