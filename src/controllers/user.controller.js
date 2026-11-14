import fs from "fs"

import UserService from "../services/user.service.js";

class UserController{
    constructor(){
        this.UserService = new UserService()
    }

    uploadDocument = async(req, res, next) =>{
    try {
    //   console.log(req.file)
      const updatedUser = await this.UserService.addDocument(
        req.params.id,
        req.file,
        req.body?.type
      )
       return res.status(200).json({
                status: "success",
                message: "Documento subido exitosamente",
                payload: updatedUser
            })
        } catch (error) {
            // Multer ya guardó el archivo: si algo falló, no debe quedar huérfano en disco
            if (req.file) await fs.promises.unlink(req.file.path).catch(() => {})
            next(error)
        }
    }

     getAll = async(req, res, next)=>{
        try{
            const users = await this.UserService.getAll()
            return res.status(200).json({
                status: "success",
                message: "Usuarios obtenidos exitosamente",
                payload: users
            })
        } catch (error) { 
            next(error) 
        }
    }

    getUserById = async(req, res, next)=>{
        try{
            const user = await this.UserService.getUserById(req.params.id)
            return res.status(200).json({
                status: "success",
                message: "Usuario obtenido exitosamente",
                payload: user
            })
        } catch (error) { 
            next(error) 
        }
    }

    create = async(req, res, next)=>{
        try{
            const user = await this.UserService.create(req.body)
            return res.status(201).json({
                status: "success",
                message: "Usuario creado exitosamente",
                payload: user
            })
        } catch (error) { 
            next(error) 
        }
    }

    update = async(req, res, next)=>{
        try{
            const user = await this.UserService.update(req.params.id, req.body)
            return res.status(200).json({
                status: "success",
                message: "Usuario actualizado exitosamente",
                payload: user
            })
        } catch (error) { 
            next(error) 
        }
    }

    delete = async(req, res, next)=>{
        try{
            const user = await this.UserService.delete(req.params.id)
            return res.status(200).json({
                status: "success",
                message: "Usuario borrado exitosamente",
                payload: user
            })
        } catch (error) { 
            next(error) 
        }
    }
}

export default UserController