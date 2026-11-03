import Product from "../models/product.model.js";

class ProductRepository {
  async findAll(filter = {}) {
    return Product.find(filter);
  }

  async findById(id) {
    return Product.findById(id);
  }

  async create(productData) {
    return Product.create(productData);
  }

  async update(id, productData) {
    return Product.findByIdAndUpdate(id, productData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return Product.findByIdAndDelete(id);
  }
}

export default ProductRepository;