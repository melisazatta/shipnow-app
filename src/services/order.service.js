// import { config } from "dotenv"
// import User from "../models/user.model.js"
import OrderRepository from "../repositories/order.repository.js"
import config from "../config/config.js"
import { ORDER_STATUS, ORDER_PRIORITY } from "../constants/index.js"
import UserRepository from "../repositories/user.repository.js"

class OrderService {

    constructor(){
    this.orderRepository = new OrderRepository()
    this.UserRepository = new UserRepository()
    
}

    async getAll(filter){
        return await this.orderRepository.findAll(filter)
    }

    async getOrderById(id){
        const order = await this.orderRepository.findById(id)

        if(!order){
            throw new Error("Orden no encontrada.")
        }
        return order
    }

    async create(orderData){
        const { customer, deliveryAddress, items } = orderData

        if(!customer || !deliveryAddress || !items || items.length < 1){
            throw new Error("Falta información requerida.")

        }

        //traer User desde repository
        const existantCustomer = await this.UserRepository.findById(customer)
        if(!existantCustomer){
            throw new Error("Cliente no encontrado.")
        }

        const total = items.reduce((acc, item)=>{
            return acc + item.price * item.quantity
        }, 0)

        const shippingCost = this.calculateShippingCost({
            isProduction: config.environment === "production", shipmentValue: total,
            apiKey: config.jwtSecret
        })
        return this.orderRepository.create({
            ...orderData,
            declaredValue: total,
            shippingCost,
            total: total + shippingCost,
            status: ORDER_STATUS.CREATED,
            priority: orderData.priority || ORDER_PRIORITY.NORMAL
        })
    }

    async update(id, orderData){
        const updatedOrder = await this.orderRepository.update(id, orderData)
        if(!updatedOrder){
            throw new Error("Pedido no encontrado.")
        }
        return updatedOrder
    }

    async delete(id){
        const deletedOrder = await this.orderRepository.delete(id)
        if(!deletedOrder){
            throw new Error("Pedido no encontrado.")
        }
        return deletedOrder
    }

    calculateShippingCost({isProduction, shipmentValue, apiKey}){
        if(!apiKey){
            throw new Error("ApiKey invalida.")
        }
        if(isProduction){
            return 50 + shipmentValue * 0.01
        }
        return 10
    }
    
}

export default OrderService