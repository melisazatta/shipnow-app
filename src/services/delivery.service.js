
import mongoose from "mongoose";
import DeliveryRepository from "../repositories/delivery.repository.js";

import { ErrorDictionary, createError } from "../utils/errors.js";
import { PROOF_TYPES } from "../constants/index.js";
import logger from "../utils/logger.js";
 

class DeliveryService {
    constructor() {
        this.deliveryRepository = new DeliveryRepository();
    }

    async getAll(filter = {}) {
        return this.deliveryRepository.findAll(filter);
    }

    async getById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw createError(ErrorDictionary.INVALID_ID);
        }

        const delivery = await this.deliveryRepository.findById(id);

        if (!delivery) {
            throw createError(ErrorDictionary.DELIVERY_NOT_FOUND);
        }

        return delivery;
    }

    async create(deliveryData) {
        const { order } = deliveryData;

        if (!order) {
             throw createError(ErrorDictionary.MISSING_REQUIRED_FIELDS)
        }

        return this.deliveryRepository.create(deliveryData);
    }

    async update(id, deliveryData) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
             throw createError(ErrorDictionary.INVALID_ID);
        }

        const delivery = await this.deliveryRepository.update(
            id,
            deliveryData
        );

        if (!delivery) {
           throw createError(ErrorDictionary.DELIVERY_NOT_FOUND);
        }

        return delivery;
    }

    async addProof(id, file) {
        if (!file) {
            throw createError(ErrorDictionary.FILE_REQUIRED);
        }
 
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw createError(ErrorDictionary.INVALID_ID);
        }
 
        // Solo se guardan los metadatos: el archivo queda en disco
        const delivery = await this.deliveryRepository.addProof(id, {
            originalName: file.originalname,
            fileName: file.filename,
            path: file.path,
            mimeType: file.mimetype,
            size: file.size,
            type: PROOF_TYPES.DELIVERY_PROOF,
            uploadedAt: new Date()
        });
 
        if (!delivery) {
            throw createError(ErrorDictionary.DELIVERY_NOT_FOUND);
        }
 
        logger.info(`Comprobante ${file.filename} asociado a la entrega ${id}`);
 
        return delivery;
    }

    async delete(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
             throw createError(ErrorDictionary.INVALID_ID);
        }

        const delivery = await this.deliveryRepository.delete(id);

        if (!delivery) {
            throw createError(ErrorDictionary.DELIVERY_NOT_FOUND);
        }

        return delivery;
    }
}

export default DeliveryService;
