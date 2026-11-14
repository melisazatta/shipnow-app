import User from "../models/user.model.js";

class UserRepository {
    async findAll(filter = {}){
        return User.find(filter).select("-password")
    }

    async findById(id){
        return User.findById(id).select("-password")
    }

    async create(userData){
        return User.create(userData)
    }

    async update(id, userData){
        return User.findByIdAndUpdate(id, userData, {new: true,  runValidators: true}).select("-password")
    }

    // $push agrega el documento sin leer ni pisar el resto del arreglo
    async addDocument(id, document){
        return User.findByIdAndUpdate(
            id,
            { $push: { documents: document } },
            { returnDocument: "after", runValidators: true }
        ).select("-password")
    }

    async findByEmail(email) {
    return User.findOne({ email });
  }

    async delete(id){
        return User.findByIdAndDelete(id).select("-password")
    }

    async insertMany(usersData){
        return User.insertMany(usersData)
    }
}

export default UserRepository