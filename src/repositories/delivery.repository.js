
import Delivery from "../models/delivery.model.js";

class DeliveryRepository {
    async findAll(filter = {}) {
        return Delivery.find(filter)
            .populate("order")
            .populate("driver", "firstName lastName email");
    }

    async findById(id) {
        return Delivery.findById(id)
            .populate("order")
            .populate("driver", "firstName lastName email");
    }

    async create(deliveryData) {
        return Delivery.create(deliveryData);
    }

    async update(id, deliveryData) {
        return Delivery.findByIdAndUpdate(
            id,
            deliveryData,
            { new: true, runValidators: true }
        );
    }

     // $push agrega el comprobante sin pisar el resto; devuelve la entrega actualizada y populada
    async addProof(id, proof) {
        return Delivery.findByIdAndUpdate(
            id,
            { $push: { proofs: proof } },
            { returnDocument: "after", runValidators: true }
        )
            .populate("order")
            .populate("driver", "firstName lastName email");
    }

    async delete(id) {
        return Delivery.findByIdAndDelete(id);
    }

    async insertMany(deliveriesData) {
        return Delivery.insertMany(deliveriesData);
    }
}

export default DeliveryRepository;
