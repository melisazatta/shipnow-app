import winston from "winston"
import config from "../config/config.js"
import DailyRotateFile from "winston-daily-rotate-file"
import { getRequestId } from "./requestContext.js"

const { combine, timestamp, colorize, errors, json, printf} = winston.format

const customLevels = {
    levels:{
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5
    },
    colors: {
        fatal: "magenta",
        error: "red",
        warning: "yellow",
        info: "green",
        http: "cyan",
        debug: "blue"
    }
}

winston.addColors(customLevels.colors)

const addRequestId = winston.format((info)=>{
    const requestId = getRequestId()
    if(requestId && !info.requestId) info.requestId = requestId
    return info
})

const consoleFormat = combine(
    colorize(),
    timestamp({format: "YYYY-MM-DD HH:mm:ss"}),
    printf(({timestamp, level, message, ...meta})=>{
        const extra = Object.keys(meta).length ? `${JSON.stringify(meta)}` : ""
        return `${timestamp} [${level}]: ${message} ${extra}`
    })
)

 const jsonFormat = combine(timestamp(), json())

 const logger = winston.createLogger({
    levels: customLevels.levels ,
    level: config.logLevel,
    format: combine(errors({stack: true}), addRequestId()),
    transports: [
        new winston.transports.Console({
            format: config.environment === "production" ? jsonFormat: consoleFormat
        }),
        new DailyRotateFile({
            filename: "logs/errors-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            maxFiles: "14d",
            level: "error",
            format: jsonFormat
        })
    ]

 })

 export default logger