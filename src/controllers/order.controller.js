import OrderService from "../services/order.service.js";

class OrderController{
    constructor(){
        this.OrderService = new OrderService()
    }

    getAll = async (req, res, next)=>{
        try{
            const orders = await this.OrderService.getAll()
            return res.status(200).json({
                status: "success",
                message: "Ordenes obtenidas exitosamente",
                payload: orders
            })
        } catch (error) { 
            next(error) 
        }
    }

    getOrderById = async (req, res, next)=>{
        try{
            const order = await this.OrderService.getOrderById(req.params.id)
            return res.status(200).json({
                status: "success",
                message: "Orden obtenida exitosamente",
                payload: order
            })
        } catch (error) { 
            next(error) 
        }
    }

    create = async (req, res, next)=>{
        try{
            const order = await this.OrderService.create(req.body)
            return res.status(201).json({
                status: "success",
                message: "Orden creada exitosamente",
                payload: order
            })
        } catch (error) { 
            next(error) 
        }
    }

    update = async (req, res, next)=>{
        try{
            const order = await this.OrderService.update(req.params.id, req.body)
            return res.status(200).json({
                status: "success",
                message: "Orden actualizada exitosamente",
                payload: order
            })
        } catch (error) { 
            next(error) 
        }
    }

    delete = async (req, res, next)=>{
        try{
            const order = await this.OrderService.delete(req.params.id)
            return res.status(200).json({
                status: "success",
                message: "Orden borrada exitosamente",
                payload: order
            })
        } catch (error) { 
            next(error) 
        }
    }
}

export default OrderController