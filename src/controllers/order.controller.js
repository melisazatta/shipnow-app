import OrderService from "../services/order.service.js";

class OrderController{
    constructor(){
        this.OrderService = new OrderService()
    }

    getAll = async (req, res)=>{
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

    getOrderById = async (req, res)=>{
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

    create = async (req, res)=>{
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

    update = async (req, res)=>{
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

    delete = async (req, res)=>{
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