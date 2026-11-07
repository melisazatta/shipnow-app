
import DeliveryService from "../services/delivery.service.js";

class DeliveryController {
    deliveryService = new DeliveryService();

    getAll = async (req, res, next) => {
        try {
            const result = await this.deliveryService.getAll(req.query);

            res.status(200).json({
                status: "success",
                payload: result
            });
        } catch (error) {
            next(error);
        }
    };

    getById = async (req, res, next) => {
        try {
            const result = await this.deliveryService.getById(req.params.id);

            res.status(200).json({
                status: "success",
                payload: result
            });
        } catch (error) {
            next(error);
        }
    };

    create = async (req, res, next) => {
        try {
            const result = await this.deliveryService.create(req.body);

            res.status(201).json({
                status: "success",
                message: "Entrega creada correctamente",
                payload: result
            });
        } catch (error) {
            next(error);
        }
    };

    update = async (req, res, next) => {
        try {
            const result = await this.deliveryService.update(
                req.params.id,
                req.body
            );

            res.status(200).json({
                status: "success",
                message: "Entrega actualizada correctamente",
                payload: result
            });
        } catch (error) {
            next(error);
        }
    };

    delete = async (req, res, next) => {
        try {
            const result = await this.deliveryService.delete(req.params.id);

            res.status(200).json({
                status: "success",
                message: "Entrega eliminada correctamente",
                payload: result
            });
        } catch (error) {
            next(error);
        }
    };
}

export default DeliveryController;
