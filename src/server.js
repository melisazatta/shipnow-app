import mongoose from "mongoose";
import app from "./app.js"
import config from "./config/config.js"
import logger from "./utils/logger.js";

const gracefullExit = (code) =>{
logger.on("finish", ()=> process.exit(code))
logger.end()
}

async function startServer() {
    try {
        await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 3000
})

logger.info("MongoDB conectada")
        // console.log("Base de datos conectada.")

// throw new Error (XD)

        app.listen(config.port, ()=> {
            // console.log(`Servidor iniciado en el puerto ${config.port}`)
           
            // console.log(`Entorno: ${config.environment}`) 
            logger.info(`Servidor iniciado en el puerto ${config.port}`, { env: config.environment})
        })

    } catch(error){
        // console.log("Error al iniciar el servidor.", error.message)

        logger.fatal(error)

        gracefullExit(1)

        // process.exit(1)
    }
}
startServer()