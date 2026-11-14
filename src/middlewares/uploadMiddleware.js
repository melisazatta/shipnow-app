import fs from "fs"
import path from "path"
import multer from "multer"

import config from "../config/config.js"
import { UPLOAD_CONFIG } from "../constants/index.js"
import { createError, ErrorDictionary } from "../utils/errors.js"
import logger from "../utils/logger.js"
 
const { FOLDERS } = UPLOAD_CONFIG
 
// Carpeta física de cada tipo de archivo, dentro de la carpeta de uploads
export const UPLOAD_FOLDERS = Object.freeze({
    DOCUMENTS: path.join(config.uploadsDir, FOLDERS.DOCUMENTS),
    RECEIPTS: path.join(config.uploadsDir, FOLDERS.RECEIPTS),
    PROOFS: path.join(config.uploadsDir, FOLDERS.PROOFS)
})

function ensureFolder(dir){
    fs.mkdirSync(dir, { recursive: true})
}

function buildStorage(folder){
    ensureFolder(folder)
    return multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, folder),
        filename: (_req, file, cb)=> {
            const extension = path.extname(file.originalname).toLowerCase()
            const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`
            cb(null, fileName)
        }
    })
}

/**
 * Tipos aceptados. Los rechazados salen por el sistema de errores centralizado
 * (415 InvalidFileType) y se registran en el logger.
 * Nota: el mimetype lo declara el cliente; no reemplaza una inspección del contenido.
 */
function buildFileFilter(allowedTypes){
    return (_req, file, cb) => {
        if(!allowedTypes.includes(file.mimetype)){
            logger.warning(`Intento de subir un archivo no permitido: ${file.originalname} (${file.mimetype})`)
            return cb(createError(ErrorDictionary.INVALID_FILE_TYPE))
        }
        cb(null, true)
    }
}

export function createUploader({
    folder,
    allowedTypes = UPLOAD_CONFIG.ALLOWED_MIME_TYPES,
    maxSize = UPLOAD_CONFIG.MAX_FILE_SIZE
}){
    return multer({
        storage: buildStorage(folder),
        fileFilter: buildFileFilter(allowedTypes),
        limits: { fileSize: maxSize, files: 1 }
    })
}

export const uploadDocument = createUploader({ folder: UPLOAD_FOLDERS.DOCUMENTS })
export const uploadReceipt = createUploader({ folder: UPLOAD_FOLDERS.RECEIPTS })
export const uploadProof = createUploader({ folder: UPLOAD_FOLDERS.PROOFS })
 