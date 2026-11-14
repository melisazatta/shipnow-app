
import { USER_ROLES, DOCUMENT_TYPES } from "../constants/index.js"
import UserRepository from "../repositories/user.repository.js"
import { createError, ErrorDictionary } from "../utils/errors.js"
import logger from "../utils/logger.js"

 const USERS_RELATED_DOCUMENTS = [
  DOCUMENT_TYPES.DRIVER_LICENSE,
  DOCUMENT_TYPES.USER_DOCUMENT
]

class UserService {

    constructor(){
    this.userRepository = new UserRepository()  
    }

  async addDocument(id, file, type){
    if(!file) throw createError(ErrorDictionary.FILE_REQUIRED);

    // Si no se envía el tipo, se toma como documento común de usuario
    const documentType = type === undefined ? DOCUMENT_TYPES.USER_DOCUMENT : type
    if(!USERS_RELATED_DOCUMENTS.includes(documentType)){
      throw createError(ErrorDictionary.INVALID_DOCUMENT_TYPE)
    }

    const user = await this.userRepository.findById(id)
    if (!user) {
      throw createError(ErrorDictionary.USER_NOT_FOUND)
    }

    // Un usuario que no es driver no puede subir una licencia de conducir
    if(documentType === DOCUMENT_TYPES.DRIVER_LICENSE && user.role !== USER_ROLES.DRIVER){
      throw createError(ErrorDictionary.DOCUMENT_NOT_ALLOWED)
    }

  // Solo se guardan los metadatos: el archivo queda en disco
    const updatedUser = await this.userRepository.addDocument(id, {
      originalName: file.originalname,
      fileName: file.filename,
      path: file.path,
      mimeType: file.mimetype,
      size: file.size,
      type: documentType,
      uploadedAt: new Date()
    })
 
    logger.info(`Documento ${documentType} cargado para el usuario ${id}: ${file.filename}`)
 
    return updatedUser
  }

    async getAll(filter = {}){
        return await this.userRepository.findAll(filter)
    }

    async getUserById(id){
        logger.debug(`Buscando usuario con ID: ${id}`)
        //  throw new Error (XD)
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

    logger.info(`Usuario creado: ${newUser._id}`)

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