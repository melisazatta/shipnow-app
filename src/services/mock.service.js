import mongoose from "mongoose";
import bcrypt from "bcrypt";

import { generateMockUsers } from "../mocks/user.mocks.js";
import { generateMockOrders } from "../mocks/order.mocks.js";
import { generateMockDeliveries } from "../mocks/delivery.mocks.js";

import UserRepository from "../repositories/user.repository.js";
import OrderRepository from "../repositories/order.repository.js";
import DeliveryRepository from "../repositories/delivery.repository.js";

import { MOCKING_PARAMETERS, USER_ROLES } from "../constants/index.js";

class MockService {
    parseQty(qty) {
        const parsedQty = Number(qty);

        if (!Number.isInteger(parsedQty) || parsedQty < 0) {
            throw new Error("qty debe ser un número entero mayor o igual a 0");
        }

        if (parsedQty > MOCKING_PARAMETERS.MAX) {
            throw new Error(`El máximo de qty es ${MOCKING_PARAMETERS.MAX}`);
        }

        return parsedQty;
    }

    getUsers(qty = MOCKING_PARAMETERS.DEFAULT) {
        const parsedQty = this.parseQty(qty);
        return generateMockUsers(parsedQty);
    }

    getOrders(qty = MOCKING_PARAMETERS.DEFAULT) {
        const parsedQty = this.parseQty(qty);
        const fakeCustomerIds = Array.from(
            { length: parsedQty },
            () => new mongoose.Types.ObjectId()
        );

        return generateMockOrders(parsedQty, fakeCustomerIds)
        // .map((order) => ({
        //     ...order,
        //     _id: new mongoose.Types.ObjectId(),
        // }));
    }

    getDeliveries(qty = MOCKING_PARAMETERS.DEFAULT) {
        const parsedQty = this.parseQty(qty);

         const customerIds = Array.from(
        { length: parsedQty },
        () => new mongoose.Types.ObjectId()
    );

        const fakeDriverIds = Array.from(
            { length: parsedQty },
            () => new mongoose.Types.ObjectId()
        );

        const orders = generateMockOrders
        // this.getOrders
        (parsedQty, customerIds);
        return generateMockDeliveries(orders, fakeDriverIds);
    }

    getDrivers(qty = MOCKING_PARAMETERS.DEFAULT) {
    const parsedQty = this.parseQty(qty);

    return this.getUsers(parsedQty)
        .filter((user) => user.role === USER_ROLES.DRIVER);
}

    async seedUsers(qty = MOCKING_PARAMETERS.DEFAULT) {
        const users = this.getUsers(qty);

        const usersToInsert = await Promise.all(
            users.map(async (user) => ({
                ...user,
                password: await bcrypt.hash(user.password, 10),
            }))
        );

        const userRepository = new UserRepository();
        const usersInserted = await userRepository.insertMany(usersToInsert);

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
            throw new Error(
                "No hay usuarios customer para asociar a los pedidos."
            );
        }

        const orderRepository = new OrderRepository();
        const ordersToInsert = generateMockOrders(parsedQty, customerIds);
        const ordersInserted = await orderRepository.insertMany(ordersToInsert);

        return {
            inserted: ordersInserted.length,
            orders: ordersInserted,
            collection: "orders",
        };
    }

    async seedDeliveries(
        qty = MOCKING_PARAMETERS.DEFAULT,
        orders = [],
        users = []
    ) {
        const parsedQty = this.parseQty(qty);

        const driverIds = users
            .filter((user) => user.role === USER_ROLES.DRIVER)
            .map((user) => user._id);

        if (driverIds.length === 0) {
            throw new Error(
                "No hay usuarios driver para asignar a las entregas."
            );
        }

        // Los pedidos cancelados pueden hacer que haya menos entregas que qty.
        const deliveriesToInsert = generateMockDeliveries(
            orders.slice(0, parsedQty),
            driverIds
        );

        if (deliveriesToInsert.length === 0) {
        return {
            inserted: 0,
            deliveries: [],
            collection: "deliveries"
        };
    }

        const deliveryRepository = new DeliveryRepository();
        const deliveriesInserted =
            await deliveryRepository.insertMany(deliveriesToInsert);

        const orderRepository = new OrderRepository();

        await Promise.all(
            deliveriesInserted.map((delivery) =>
                orderRepository.linkDelivery(delivery.order, delivery._id)
            )
        );

        return {
            inserted: deliveriesInserted.length,
            deliveries: deliveriesInserted,
            collection: "deliveries",
        };
    }

   async seed(qty = MOCKING_PARAMETERS.DEFAULT) {
    const mockService = new MockService();

    const usersMocked = await mockService.seedUsers(qty);

    const ordersMocked = await mockService.seedOrders(
        qty,
        usersMocked.users
    );

    const deliveriesMocked = await mockService.seedDeliveries(
        qty,
        ordersMocked.orders,
        usersMocked.users
    );

    console.log("Usuarios mockeados:", usersMocked.inserted);

    return {
        users: {
            inserted: usersMocked.inserted,
            collection: "users"
        },
        orders: {
            inserted: ordersMocked.inserted,
            collection: "orders"
    },
        deliveries: {
            inserted: deliveriesMocked.inserted,
            collection: "deliveries"
        }
    }
} 
}


export default new MockService();







// import { generateMockUsers } from "../mocks/user.mocks.js"
// import UserRepository from "../repositories/user.repository.js"
// import bcrypt from "bcrypt"

// // import AppError from "../middlewares/errors.js"

// import { MOCKING_PARAMETERS, USER_ROLES } from "../constants/index.js"

// class MockService {
//     getUsers(qty = MOCKING_PARAMETERS.DEFAULT){
//         let parsedQty = Number(qty)
//         if(!Number.isInteger(parsedQty)){
//             throw new Error ("qty debe ser un numero")
//         }
//         if(parsedQty> MOCKING_PARAMETERS.MAX){
//            throw new Error (`El maximo de qty es ${MOCKING_PARAMETERS.MAX}`)}
           
//            return generateMockUsers(parsedQty)
//     }

//     //Orders
//      getOrders(qty = MOCKING_PARAMETERS.DEFAULT){
//         const parsedQty = this.parseQty(qty)
//         const fakeCustomerIds = Array.from({ length: parsedQty }, () => new mongoose.Types.ObjectId())

//         return generateMockOrders(parsedQty, fakeCustomerIds)
//             .map((order) => ({ _id: new mongoose.Types.ObjectId(), ...order }))
//     }
//     //Deliveries
//     getDeliveries(qty = MOCKING_PARAMETERS.DEFAULT){
//         const parsedQty = this.parseQty(qty)
//         const fakeDriverIds = Array.from({ length: parsedQty }, () => new mongoose.Types.ObjectId())

//         return generateMockDeliveries(this.getOrders(parsedQty), fakeDriverIds)
//     }


//     async seedUsers(qty = MOCKING_PARAMETERS.DEFAULT){

//         let users = this.getUsers(qty)

//         const usersToInsert = await Promise.all(users.map(async(user)=>({
//             ...user,
//             password: await bcrypt.hash(user.password, 10)
//         }))
//     )

//     const userRepository = new UserRepository()

//     const usersInserted = await userRepository.insertMany(usersToInsert)

//     return {
//         inserted: usersInserted.length,
//         users: usersInserted,
//         collection: "user"}
//     }

//     //Seed
//     async seedOrders(qty = MOCKING_PARAMETERS.DEFAULT, users){
//         const parsedQty = this.parseQty(qty)

//         const customerIds = users
//             .filter((user) => user.role === USER_ROLES.CUSTOMER)
//             .map((user) => user._id)

//         if (!customerIds.length) {
//             throw new Error("No hay usuarios customer para asociar a los pedidos, volvé a intentar")
//         }

//         const orderRepository = new OrderRepository()
//         const ordersInserted = await orderRepository.insertMany(generateMockOrders(parsedQty, customerIds))

//         return {
//             inserted: ordersInserted.length,
//             orders: ordersInserted,
//             collection: "orders"
//         }
//     }

//     async seedDeliveries(qty = MOCKING_PARAMETERS.DEFAULT, orders, users){
//         const parsedQty = this.parseQty(qty)

//         const driverIds = users
//             .filter((user) => user.role === USER_ROLES.DRIVER)
//             .map((user) => user._id)

//         if (!driverIds.length) {
//             throw new Error("No hay usuarios driver para asignar a las entregas, volvé a intentar")
//         }

//         // Los pedidos cancelados no generan entrega, por eso pueden ser menos que qty
//         const deliveriesToInsert = generateMockDeliveries(orders.slice(0, parsedQty), driverIds)

//         const deliveryRepository = new DeliveryRepository()
//         const deliveriesInserted = await deliveryRepository.insertMany(deliveriesToInsert)

//         // Pedido entrega: cada pedido guarda el id de su entrega
//         const orderRepository = new OrderRepository()
//         await Promise.all(
//             deliveriesInserted.map((delivery) => orderRepository.linkDelivery(delivery.order, delivery._id))
//         )

//         return {
//             inserted: deliveriesInserted.length,
//             deliveries: deliveriesInserted,
//             collection: "deliveries"
//         }
//     }
// }

//  async function seed(){
//      const mockService = new MockService()

//      let usersMocked = await mockService.seedUsers(10)
//      let ordersMocked = await mockService.seedOrders(10, mockedUsers) 
//      let deliveriesMocked = await mockService.seedDeliveries(10, ordersMocked)
 
//      console.log("usuariosMockeados", usersMocked.inserted)

//      return {
//         users:{
//             inserted: usersMocked.inserted
//         }, ordersMocked, deliveriesMocked
//      }
    
//  }

// export default new MockService()