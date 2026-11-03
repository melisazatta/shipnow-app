import mongoose from "mongoose";
import app from "./app.js"
import config from "./config/config.js"

async function startServer() {
    try {
        await mongoose.connect(config.mongoUri)
        console.log("Base de datos conectada.")

        app.listen(config.port, ()=> {
            console.log(`Servidor iniciado en el puerto ${config.port}`)
           
            console.log(`Entorno: ${config.environment}`) 
        })

    } catch(error){
        console.log("Error al iniciar el servidor.", error.message)
        process.exit(1)
    }
}
startServer()