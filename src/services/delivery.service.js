
import mongoose from "mongoose";
import DeliveryRepository from "../repositories/delivery.repository.js";

import { ErrorDictionary, createError } from "../utils/errors.js";

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
