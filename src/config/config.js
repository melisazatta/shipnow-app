import dotenv from 'dotenv'

dotenv.config()

const requiredEnvs = ['PORT', 'MONGODB_URI', 'JWT_SECRET', 'NODE_ENV']

requiredEnvs.forEach((envVars)=>{
    if(!process.env[envVars]) {
        throw new Error(`Falta la variable de entorno: ${envVars}`)
    }
})

const config = {
    port: Number(process.env.PORT),
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    environment: process.env.NODE_ENV,
    logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug")
}

export default config