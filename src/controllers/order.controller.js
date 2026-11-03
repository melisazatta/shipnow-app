import OrderService from "../services/order.service.js";

class OrderController{
    constructor(){
        this.OrderService = new OrderService()
    }

    async getAll(req, res){
        try{
            const orders = await this.OrderService.getAll()
            return res.status(200).json({
                status: "success",
                message: "Ordenes obtenidas exitosamente",
                payload: orders
            })
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: "internal server error: " + error.message
            })
        }
    }

    async getOrderById(req, res){
        try{
            const order = await this.OrderService.getOrderById(req.params.id)
            return res.status(200).json({
                status: "success",
                message: "Orden obtenida exitosamente",
                payload: order
            })
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: "internal server error: " + error.message
            })
        }
    }

    async create(req, res){
        try{
            const order = await this.OrderService.create(req.body)
            return res.status(200).json({
                status: "success",
                message: "Orden creada exitosamente",
                payload: order
            })
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: "internal server error: " + error.message
            })
        }
    }

    async update(req, res){
        try{
            const order = await this.OrderService.update(req.params.id, req.body)
            return res.status(200).json({
                status: "success",
                message: "Orden actualizada exitosamente",
                payload: order
            })
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: "internal server error: " + error.message
            })
        }
    }

    async delete(req, res){
        try{
            const order = await this.OrderService.delete(req.params.id)
            return res.status(200).json({
                status: "success",
                message: "Orden borrada exitosamente",
                payload: order
            })
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: "internal server error: " + error.message
            })
        }
    }
}

export default OrderController