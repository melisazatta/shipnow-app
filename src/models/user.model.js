import mongoose from 'mongoose';
import { USER_ROLES, DOCUMENT_TYPES } from '../constants/index.js';

const documentSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  fileName: { type: String, required: true },
  path: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required:true },
  type: { type: String, enum: Object.values(DOCUMENT_TYPES), required: true},
  uploadedAt: { type: Date, default: Date.now }
}, {_id: false})


const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'El apellido es obligatorio'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria']
  },
  role: {
    type: String,
     enum: Object.values(USER_ROLES),
     default: USER_ROLES.CUSTOMER
  },
  documents: {
    type: [
      documentSchema
      // {
      //   name: { type: String },
      //   reference: { type: String }
      // }
    ],
    default: []
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;