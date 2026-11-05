
import OrderRepository from "../repositories/order.repository.js"
import config from "../config/config.js"
import { ORDER_STATUS, ORDER_PRIORITY } from "../constants/index.js"
import UserRepository from "../repositories/user.repository.js"
import { ErrorDictionary, createError } from "../utils/errors.js"

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
           throw createError(ErrorDictionary.ORDER_NOT_FOUND)
        }
        return order
    }

    async create(orderData){
        const { customer, deliveryAddress, items } = orderData

        if(!customer || !deliveryAddress || !Array.isArray(items) || items.length < 1){
            throw createError(ErrorDictionary.MISSING_REQUIRED_FIELDS)

        }

        //traer User desde repository
        const existantCustomer = await this.UserRepository.findById(customer)
        if(!existantCustomer){
            throw createError(ErrorDictionary.USER_NOT_FOUND)
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

        if (orderData.status !== undefined && !Object.values(ORDER_STATUS).includes(orderData.status)) {
        throw createError(ErrorDictionary.INVALID_STATUS)
    }

        const updatedOrder = await this.orderRepository.update(id, orderData)
        if(!updatedOrder){
             throw createError(ErrorDictionary.ORDER_NOT_FOUND)
        }
        return updatedOrder
    }

    async delete(id){
        const deletedOrder = await this.orderRepository.delete(id)
        if(!deletedOrder){
             throw createError(ErrorDictionary.ORDER_NOT_FOUND)
        }
        return deletedOrder
    }

    calculateShippingCost({isProduction, shipmentValue, apiKey}){
        if(!apiKey){
             throw createError(ErrorDictionary.MISSING_API_KEY)
        }
        if(isProduction){
            return 50 + shipmentValue * 0.01
        }
        return 10
    }
    
}

export default OrderService