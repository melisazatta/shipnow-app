import mongoose from 'mongoose';
import { DELIVERY_STATUS, ORDER_PRIORITY, PROOF_TYPES } from '../constants/index.js';

// Metadatos del comprobante: el archivo en sí queda en disco, no en la base
const proofSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  fileName: { type: String, required: true },
  path: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, enum: Object.values(PROOF_TYPES), default: PROOF_TYPES.DELIVERY_PROOF },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const deliverySchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'El pedido es obligatorio']
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: Object.values(DELIVERY_STATUS), default: DELIVERY_STATUS.PENDING
  },
  priority: {
    type: String,
    enum: Object.values(ORDER_PRIORITY),  default: ORDER_PRIORITY.NORMAL
  },
  assignedAt: {
    type: Date,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  proofs: {
    type: [proofSchema],
    default: []
  }
}, {
  timestamps: true
});

const Delivery = mongoose.model('Delivery', deliverySchema);

export default Delivery;