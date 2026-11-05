
import { USER_ROLES } from "../constants/index.js"
import UserRepository from "../repositories/user.repository.js"
import { createError, ErrorDictionary } from "../utils/errors.js"

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
            throw createError(ErrorDictionary.USER_NOT_FOUND)
        }
        return user
    }

    async create(userData){
        const { firstName, lastName, email, password } = userData

        if(!firstName || !lastName || !email || !password){
            throw createError(ErrorDictionary.MISSING_REQUIRED_FIELDS)

        }

        const normalizedEmail = email.trim().toLowerCase();

    const existingUser =
      await this.userRepository.findByEmail(normalizedEmail);

    if (existingUser) {
       throw createError(ErrorDictionary.USER_ALREADY_EXISTS)
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
             throw createError(ErrorDictionary.USER_NOT_FOUND)
        }
        return updatedUser
    }

    async delete(id){
        const deletedUser = await this.userRepository.delete(id)
        if(!deletedUser){
             throw createError(ErrorDictionary.USER_NOT_FOUND)
        }
        return deletedUser
    }
    
}

export default UserService




//Hashear password - bcrypt / no actualizar pass y role