
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";

import {
    ORDER_STATUS,
    DELIVERY_STATUS
} from "../constants/index.js";

const deliveryStatusByOrder = {
    [ORDER_STATUS.CREATED]: DELIVERY_STATUS.PENDING,
    [ORDER_STATUS.ASSIGNED]: DELIVERY_STATUS.ASSIGNED,
    [ORDER_STATUS.PICKED_UP]: DELIVERY_STATUS.ASSIGNED,
    [ORDER_STATUS.IN_TRANSIT]: DELIVERY_STATUS.IN_TRANSIT,
    [ORDER_STATUS.DELIVERED]: DELIVERY_STATUS.DELIVERED
};

const generateMockDelivery = (order, driverIds) => {
    const status = deliveryStatusByOrder[order.status];

    // Si el estado del pedido no tiene entrega asociada
    if (!status) return null;

    const hasDriver = status !== DELIVERY_STATUS.PENDING;

    const assignedAt = hasDriver
        ? faker.date.recent({ days: 7 })
        : null;

    return {
        _id: new mongoose.Types.ObjectId(),
        order: order._id,
        driver: hasDriver
            ? faker.helpers.arrayElement(driverIds)
            : null,
        status,
        priority: order.priority,
        assignedAt,
        deliveredAt: status === DELIVERY_STATUS.DELIVERED
            ? faker.date.soon({ days: 2, refDate: assignedAt })
            : null
    };
};

export const generateMockDeliveries = (orders, driverIds) => {
    const deliveriesData = [];

    for (const order of orders) {
        const delivery = generateMockDelivery(order, driverIds);

        if (delivery) {
            deliveriesData.push(delivery);
        }
    }

    return deliveriesData;
};
