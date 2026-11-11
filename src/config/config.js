import dotenv from 'dotenv'

dotenv.config({ quiet: true })

const isTest = process.env.NODE_ENV === 'test'

const requiredEnvs = ['PORT', 'JWT_SECRET', 'NODE_ENV', isTest ? 'MONGODB_URI_TEST' : 'MONGODB_URI']

requiredEnvs.forEach((envVars)=>{
    if(!process.env[envVars]) {
        throw new Error(`Falta la variable de entorno: ${envVars}`)
    }
})

const config = {
    port: Number(process.env.PORT),
    mongoUri: isTest ? process.env.MONGODB_URI_TEST : process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    environment: process.env.NODE_ENV,
    logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug")
}

export default config