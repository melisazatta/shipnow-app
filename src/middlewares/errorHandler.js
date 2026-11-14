import {createError, ErrorDictionary} from "../utils/errors.js"
import logger from "../utils/logger.js"

// Errores de Multer -> errores del proyecto
const MULTER_ERRORS = {
    LIMIT_FILE_SIZE: ErrorDictionary.FILE_TOO_LARGE,
    LIMIT_UNEXPECTED_FILE: ErrorDictionary.UNEXPECTED_FILE_FIELD
}
 
// Errores del sistema de archivos al guardar (disco lleno, sin permisos, carpeta inexistente)
const FS_ERROR_CODES = ["ENOENT", "EACCES", "EPERM", "ENOSPC", "EROFS"]

export const errorHandler = (err,req,res,next) =>{
    //Id de Mongo mal formado
     if (err.name === "CastError" && err.path === "_id"){
        err = createError(ErrorDictionary.INVALID_ID)
    }
    

    if(err.type === "entity.parse.failed"){
        err = createError(ErrorDictionary.INVALID_JSON)
    }

    // Errores de carga de archivos
    if (err.name === "MulterError") {
        err = createError(MULTER_ERRORS[err.code] ?? ErrorDictionary.FILE_UPLOAD_ERROR)
    }
 
    if (err.syscall && FS_ERROR_CODES.includes(err.code)) {
        err = createError({ ...ErrorDictionary.FILE_SAVE_ERROR, cause: err })
    }
    
    if (err.name === "ValidationError") {
    const detail = Object.values(err.errors).map((e) => e.message).join(", ")
    err = createError({ ...ErrorDictionary.VALIDATION_ERROR, message: detail })
}

if (err.code === 11000) {
err = createError(ErrorDictionary.DUPLICATE_KEY)
}

const status = err.status ?? 500
const meta = {
    requestId: req?.requestId ?? "",
    method: req?.method ?? "",
    path: req.originalUrl,
    code: err.code ?? 0 
}

if(status >=500){
     logger.error(`${err.name} - ${err.message}`, {...meta, stack: err.stack})
}else{
    logger.warning(`${err.name} - ${err.message}`, meta)
}
    res.status(status).json({
        status:"error",
        error:{
            name: err.name ? err.name : "InternalError",
            code:err.code ? err.code : 0,
            message:err.message? err.message : "Error interno del servidor"
        }
    })
}