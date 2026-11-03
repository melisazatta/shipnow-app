// import { config } from "dotenv"
// import User from "../models/user.model.js"
import { USER_ROLES } from "../constants/index.js"
import UserRepository from "../repositories/user.repository.js"
// import config from "../config/config.js"
// import { ORDER_STATUS, ORDER_PRIORITY } from "../constants/index.js"

class UserService {

    constructor(){
    this.userRepository = new UserRepository()  
    }

    async getAll(filter = {}){
        return await this.userRepository.findAll(filter)
    }

    async getUserById(id){
        const user = await this.userRepository.findById(id)

        if(!user){
            throw new Error("Usuario no encontrado.")
        }
        return user
    }

    async create(userData){
        const { firstName, lastName, email, password } = userData

        if(!firstName || !lastName || !email || !password){
            throw new Error("Falta información requerida.")

        }

        const normalizedEmail = email.trim().toLowerCase();

    const existingUser =
      await this.userRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      const error = new Error(
        "El email ya está registrado."
      );
      error.statusCode = 409;
      throw error;
    }

     const newUser = await this.userRepository.create({
      firstName,
      lastName,
      email: normalizedEmail,
      password,
      role: USER_ROLES.CUSTOMER
    });

    /////////
     const userObject = newUser.toObject();
    delete userObject.password;

    return userObject;
    }

    async update(id, userData){
        const updatedUser = await this.userRepository.update(id, userData)
        if(!updatedUser){
            throw new Error("Usuario no encontrado.")
        }
        return updatedUser
    }

    async delete(id){
        const deletedUser = await this.userRepository.delete(id)
        if(!deletedUser){
            throw new Error("Usuario no encontrado.")
        }
        return deletedUser
    }
    
}

//Hashear password - bcrypt / no actualizar pass y role

export default UserService