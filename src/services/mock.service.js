import mongoose from "mongoose";
import bcrypt from "bcrypt";

import { generateMockUsers } from "../mocks/user.mocks.js";
import { generateMockOrders } from "../mocks/order.mocks.js";
import { generateMockDeliveries } from "../mocks/delivery.mocks.js";

import UserRepository from "../repositories/user.repository.js";
import OrderRepository from "../repositories/order.repository.js";
import DeliveryRepository from "../repositories/delivery.repository.js";

import { MOCKING_PARAMETERS, USER_ROLES } from "../constants/index.js";
import { ErrorDictionary, createError } from "../utils/errors.js";
import logger from "../utils/logger.js";

class MockService {
  parseQty(qty) {
    const parsedQty = Number(qty);

    if (qty === "" || !Number.isInteger(parsedQty)) {
      throw createError({
        ...ErrorDictionary.INVALID_QUANTITY,
        message: "qty debe ser un número entero",
      });
    }
    if (parsedQty < 1) {
      throw createError({
        ...ErrorDictionary.INVALID_QUANTITY,
        message: "qty debe ser mayor a 0",
      });
    }
    if (parsedQty > MOCKING_PARAMETERS.MAX) {
      throw createError({
        ...ErrorDictionary.INVALID_QUANTITY,
        message: `El máximo de qty es ${MOCKING_PARAMETERS.MAX}`,
      });
    }

    return parsedQty;
  }

  getUsers(qty = MOCKING_PARAMETERS.DEFAULT) {
    const parsedQty = this.parseQty(qty);
    logger.debug(`Generando ${parsedQty} usuarios mock`);
    return generateMockUsers(parsedQty);
  }

  getOrders(qty = MOCKING_PARAMETERS.DEFAULT) {
    const parsedQty = this.parseQty(qty);

    logger.debug(`Generando ${parsedQty} pedidos mock`);

    const fakeCustomerIds = Array.from(
      { length: parsedQty },
      () => new mongoose.Types.ObjectId(),
    );

    return generateMockOrders(parsedQty, fakeCustomerIds);
    // .map((order) => ({
    //     ...order,
    //     _id: new mongoose.Types.ObjectId(),
    // }));
  }

  getDeliveries(qty = MOCKING_PARAMETERS.DEFAULT) {
    const parsedQty = this.parseQty(qty);

    logger.debug(`Generando ${parsedQty} entregas mock`);

    const customerIds = Array.from(
      { length: parsedQty },
      () => new mongoose.Types.ObjectId(),
    );

    const fakeDriverIds = Array.from(
      { length: parsedQty },
      () => new mongoose.Types.ObjectId(),
    );

    const orders = generateMockOrders(
      // this.getOrders
      parsedQty,
      customerIds,
    );
    return generateMockDeliveries(orders, fakeDriverIds);
  }

  getDrivers(qty = MOCKING_PARAMETERS.DEFAULT) {
    const parsedQty = this.parseQty(qty);

    return this.getUsers(parsedQty).filter(
      (user) => user.role === USER_ROLES.DRIVER,
    );
  }

  async seedUsers(qty = MOCKING_PARAMETERS.DEFAULT) {
    const users = this.getUsers(qty);

    const usersToInsert = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      })),
    );

    const userRepository = new UserRepository();

    let usersInserted;
    try {
      usersInserted = await userRepository.insertMany(usersToInsert);
    } catch (error) {
      throw createError({ ...ErrorDictionary.DATABASE_ERROR, cause: error });
    }

    // const usersInserted = await userRepository.insertMany(usersToInsert);

    return {
      inserted: usersInserted.length,
      users: usersInserted,
      collection: "users",
    };
  }

  async seedOrders(qty = MOCKING_PARAMETERS.DEFAULT, users = []) {
    const parsedQty = this.parseQty(qty);

    const customerIds = users
      .filter((user) => user.role === USER_ROLES.CUSTOMER)
      .map((user) => user._id);

    if (customerIds.length === 0) {
      throw createError({
        ...ErrorDictionary.MOCK_DATA_MISSING,
        message: "No hay usuarios customer para asociar a los pedidos.",
      });
    }

    const orderRepository = new OrderRepository();
    const ordersToInsert = generateMockOrders(parsedQty, customerIds);

    let ordersInserted;
    try {
      ordersInserted = await orderRepository.insertMany(ordersToInsert);
    } catch (error) {
      throw createError({ ...ErrorDictionary.DATABASE_ERROR, cause: error });
    }

    // const ordersInserted = await orderRepository.insertMany(ordersToInsert);

    return {
      inserted: ordersInserted.length,
      orders: ordersInserted,
      collection: "orders",
    };
  }

  async seedDeliveries(
    qty = MOCKING_PARAMETERS.DEFAULT,
    orders = [],
    users = [],
  ) {
    const parsedQty = this.parseQty(qty);

    const driverIds = users
      .filter((user) => user.role === USER_ROLES.DRIVER)
      .map((user) => user._id);

    if (driverIds.length === 0) {
      throw createError({
        ...ErrorDictionary.MOCK_DATA_MISSING,
        message: "No hay usuarios driver para asignar a las entregas.",
      });
    }

    // Los pedidos cancelados pueden hacer que haya menos entregas que qty.
    const deliveriesToInsert = generateMockDeliveries(
      orders.slice(0, parsedQty),
      driverIds,
    );

    if (deliveriesToInsert.length === 0) {
      return {
        inserted: 0,
        deliveries: [],
        collection: "deliveries",
      };
    }

    const deliveryRepository = new DeliveryRepository();

    let deliveriesInserted;
    try {
      deliveriesInserted =
        await deliveryRepository.insertMany(deliveriesToInsert);
    } catch (error) {
      throw createError({ ...ErrorDictionary.DATABASE_ERROR, cause: error });
    }
    // const deliveriesInserted =
    //     await deliveryRepository.insertMany(deliveriesToInsert);

    const orderRepository = new OrderRepository();

    try {
      await Promise.all(
        deliveriesInserted.map((delivery) =>
          orderRepository.linkDelivery(delivery.order, delivery._id),
        ),
      );
    } catch (error) {
      throw createError({ ...ErrorDictionary.DATABASE_ERROR, cause: error });
    }

    return {
      inserted: deliveriesInserted.length,
      deliveries: deliveriesInserted,
      collection: "deliveries",
    };
  }

  async seed(qty = MOCKING_PARAMETERS.DEFAULT) {
    const mockService = new MockService();

    const usersMocked = await mockService.seedUsers(qty);

    const ordersMocked = await mockService.seedOrders(qty, usersMocked.users);

    const deliveriesMocked = await mockService.seedDeliveries(
      qty,
      ordersMocked.orders,
      usersMocked.users,
    );

    // console.log("Usuarios mockeados:", usersMocked.inserted);
    logger.info("Seed de mocks completado", {
      users: usersMocked.inserted,
      orders: ordersMocked.inserted,
      deliveries: deliveriesMocked.inserted,
    });

    return {
      users: {
        inserted: usersMocked.inserted,
        collection: "users",
      },
      orders: {
        inserted: ordersMocked.inserted,
        collection: "orders",
      },
      deliveries: {
        inserted: deliveriesMocked.inserted,
        collection: "deliveries",
      },
    };
  }
}

export default new MockService();
