import UserService from "../services/user.service.js";

class UserController{
    constructor(){
        this.UserService = new UserService()
    }

    async getAll(req, res){
        try{
            const users = await this.UserService.getAll()
            return res.status(200).json({
                status: "success",
                message: "Usuarios obtenidos exitosamente",
                payload: users
            })
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: "internal server error: " + error.message
            })
        }
    }

    async getUserById(req, res){
        try{
            const user = await this.UserService.getUserById(req.params.id)
            return res.status(200).json({
                status: "success",
                message: "Usuario obtenido exitosamente",
                payload: user
            })
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: "internal server error: " + error.message
            })
        }
    }

    async create(req, res){
        try{
            const user = await this.UserService.create(req.body)
            return res.status(200).json({
                status: "success",
                message: "Usuario creado exitosamente",
                payload: user
            })
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: "internal server error: " + error.message
            })
        }
    }

    async update(req, res){
        try{
            const user = await this.UserService.update(req.params.id, req.body)
            return res.status(200).json({
                status: "success",
                message: "Usuario actualizado exitosamente",
                payload: user
            })
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: "internal server error: " + error.message
            })
        }
    }

    async delete(req, res){
        try{
            const user = await this.UserService.delete(req.params.id)
            return res.status(200).json({
                status: "success",
                message: "Usuario borrado exitosamente",
                payload: user
            })
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: "internal server error: " + error.message
            })
        }
    }
}

export default UserController