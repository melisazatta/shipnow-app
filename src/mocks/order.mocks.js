import mongoose from "mongoose"
import { faker } from "@faker-js/faker"
import { ORDER_STATUS, ORDER_PRIORITY } from "../constants/index.js"
//Estado de la entrega segun el estado del pedido
// const mockeables_status = {
//     [ORDER_STATUS.CREATED]: DELIVERY_STATUS.PENDING,
//     [ORDER_STATUS.ASSIGNED]: DELIVERY_STATUS.ASSIGNED,
//     [ORDER_STATUS.PICKED_UP]: DELIVERY_STATUS.ASSIGNED,
//     [ORDER_STATUS.IN_TRANSIT]: DELIVERY_STATUS.IN_TRANSIT,
//     [ORDER_STATUS.DELIVERED]: DELIVERY_STATUS.DELIVERED
// }


const round2 = (n) => Math.round(n * 100) / 100

const generateMockItems = () =>{
    return Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => ({
        name: faker.commerce.productName(),
        quantity: faker.number.int({ min: 1, max: 5 }),
        price: faker.number.float({ min: 5, max: 200, fractionDigits: 2 })
    }))
}

// const generateMockOrderWithDelivery = ({ customerIds, driverIds }) => {
//     const status = faker.helpers.arrayElement(Object.values(ORDER_STATUS))
//     const priority = faker.helpers.arrayElement(Object.values(ORDER_PRIORITY))
//     const items = generateMockItems()
//     const subtotal = round2(items.reduce((acc, i) => acc + i.quantity * i.price, 0))
//     const shippingCost = faker.number.float({ min: 2, max: 20, fractionDigits: 2 })

//     const orderId = new mongoose.Types.ObjectId()
//     const deliveryStatus = mockeables_status[status]

//     let delivery = null
//     if (deliveryStatus) {
//         const hasDriver = deliveryStatus !== DELIVERY_STATUS.PENDING
//         const assignedAt = hasDriver ? faker.date.recent({ days: 7 }) : null

//         delivery = {
//             _id: new mongoose.Types.ObjectId(),
//             order: orderId,                                              // entrega ↔ pedido
//             driver: hasDriver ? faker.helpers.arrayElement(driverIds) : null, // repartidor solo si corresponde
//             status: deliveryStatus,
//             priority,
//             assignedAt,
//             deliveredAt: deliveryStatus === DELIVERY_STATUS.DELIVERED
//                 ? faker.date.soon({ days: 2, refDate: assignedAt })
//                 : null
//         }
//     }

//     const order = {
//         _id: orderId,
//         customer: faker.helpers.arrayElement(customerIds),  // pedido usuario
//         items,
//         deliveryAddress: `${faker.location.streetAddress()}, ${faker.location.city()}`,
//         total: round2(subtotal + shippingCost),
//         shippingCost,
//         declaredValue: subtotal,
//         status,
//         priority,
//         delivery: delivery?._id ?? null
//     }

//     return { order, delivery }
    
// }
const generateMockOrder = (customerIds) => {
    const items = generateMockItems();

    const subtotal = round2(
        items.reduce(
            (acc, item) => acc + item.quantity * item.price,
            0
        )
    );

    const shippingCost = faker.number.float({
        min: 2,
        max: 20,
        fractionDigits: 2
    });

    return {
        _id: new mongoose.Types.ObjectId(),
        customer: faker.helpers.arrayElement(customerIds),
        items,
        deliveryAddress: `${faker.location.streetAddress()}, ${faker.location.city()}`,
        total: round2(subtotal + shippingCost),
        shippingCost,
        declaredValue: subtotal,
        status: faker.helpers.arrayElement(Object.values(ORDER_STATUS)),
        priority: faker.helpers.arrayElement(Object.values(ORDER_PRIORITY)),
        delivery: null
    };
};


// export const generateMockOrdersWithDeliveries = (qty, { customerIds, driverIds }) => {
//     const orders = []
//     const deliveries = []

//     for (let i = 0; i < qty; i++) {
//         const { order, delivery } = generateMockOrderWithDelivery({ customerIds, driverIds })
//         orders.push(order)
//         if (delivery) deliveries.push(delivery)
//     }
export const generateMockOrders = (qty, customerIds) => {
    const ordersData = [];

    for (let i = 0; i < qty; i++) {
        ordersData.push(generateMockOrder(customerIds));
    }

    return ordersData;
    // return { orders, deliveries }
}