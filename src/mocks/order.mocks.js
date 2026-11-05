import mongoose from "mongoose"
import { faker } from "@faker-js/faker"
import { ORDER_STATUS, ORDER_PRIORITY } from "../constants/index.js"

const round2 = (n) => Math.round(n * 100) / 100

const generateMockItems = () =>{
    return Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => ({
        name: faker.commerce.productName(),
        quantity: faker.number.int({ min: 1, max: 5 }),
        price: faker.number.float({ min: 5, max: 200, fractionDigits: 2 })
    }))
}

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

export const generateMockOrders = (qty, customerIds) => {
    const ordersData = [];

    for (let i = 0; i < qty; i++) {
        ordersData.push(generateMockOrder(customerIds));
    }

    return ordersData;
    // return { orders, deliveries }
}