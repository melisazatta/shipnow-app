import mongoose from "mongoose";
import { PRODUCT_STATUS } from "../constants/index.js";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "El nombre del producto es obligatorio"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "La descripción es obligatoria"],
    trim: true
  },
  price: {
    type: Number,
    required: [true, "El precio es obligatorio"],
    min: [0, "El precio no puede ser negativo"]
  },
  stock: {
    type: Number,
    required: [true, "El stock es obligatorio"],
    min: [0, "El stock no puede ser negativo"],
    default: 0
  },
  status: {
    type: String,
    enum: Object.values(PRODUCT_STATUS),
    default: PRODUCT_STATUS.AVAILABLE
  }
}, {
  timestamps: true
});

const Product = mongoose.model("Product", productSchema);

export default Product;