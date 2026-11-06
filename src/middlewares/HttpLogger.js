import logger from "../utils/logger.js";
import { randomUUID} from "node:crypto"
import { requestContext } from "../utils/requestContext.js";

export const loggerHttp = (req, res, next) => {
    const start = Date.now()
    req.requestId = randomUUID()
    res.setHeader("x-request-id", req.requestId)

    res.on("finish", ()=>{
      logger.http(`${req.method} ${req.originalUrl} ${res.statusCode}`, {
        ms: Date.now() - start,
        requestId: req.requestId
        // body: req.body,
        // params: req.params,
        // query: req.query
      })  
    })
    
    // next()
    requestContext.run({ requestId:  req.requestId}, next)
}