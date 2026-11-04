import mockService from "../services/mock.service.js";


class MockController {
    getUsers(req, res, next){
        try{
            const result = mockService.getUsers(req.query.qty)

            res.json({status: "success", payload: result})
        } catch (error) {
            next(error)
        }
    }

    //Drivers
     getDrivers(req, res, next){
        try{
            const result = mockService.getDrivers(req.query.qty)

            res.json({status: "success", payload: result})
        } catch (error) {
            next(error)
        }
    }
    //Orders
     getOrders(req, res, next){
        try{
            const result = mockService.getOrders(req.query.qty)

            res.json({status: "success", payload: result})
        } catch (error) {
            next(error)
        }
    }
    //Deliveries
     getDeliveries(req, res, next){
        try{
            const result = mockService.getDeliveries(req.query.qty)

            res.json({status: "success", payload: result})
        } catch (error) {
            next(error)
        }
    }

    async seed(req, res, next) {
        try {
            const result = await mockService.seed(req.query.qty);

            res.json({
                status: "success",
                payload: result
            });
        } catch (error) {
            next(error);
        }
    }

    async seedUsers(req, res, next) {
        try{
             const result = await mockService.seedUsers(req.query.qty)
            res.json({status: "success", payload: result})
        } catch (error) {
            next(error)
        }
    }
}

export default new MockController()