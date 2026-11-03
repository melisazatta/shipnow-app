import ProductRepository from "../repositories/product.repository.js";
import { PRODUCT_STATUS } from "../constants/index.js";

class ProductService {
  constructor() {
    this.productRepository = new ProductRepository();
  }

  async getAll(filter = {}) {
    return await this.productRepository.findAll(filter);
  }

  async getProductById(id) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new Error("Producto no encontrado.");
    }

    return product;
  }

  async create(productData) {
    const { name, description, price, stock } = productData;

    if (!name || price === undefined || stock === undefined) {
      throw new Error("Falta información requerida.");
    }

    if (price < 0) {
      throw new Error("El precio no puede ser negativo.");
    }

    if (stock < 0) {
      throw new Error("El stock no puede ser negativo.");
    }

    const status =
      stock > 0
        ? PRODUCT_STATUS.AVAILABLE
        : PRODUCT_STATUS.OUT_OF_STOCK;

    return await this.productRepository.create({
      name,
      description,
      price,
      stock,
      status
    });
  }

  async update(id, productData) {
    const { name, description, price, stock } = productData;

    if (price !== undefined && price < 0) {
      throw new Error("El precio no puede ser negativo.");
    }

    if (stock !== undefined && stock < 0) {
      throw new Error("El stock no puede ser negativo.");
    }

    const dataToUpdate = {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price }),
      ...(stock !== undefined && { stock })
    };

    if (stock !== undefined) {
      dataToUpdate.status =
        stock > 0
          ? PRODUCT_STATUS.AVAILABLE
          : PRODUCT_STATUS.OUT_OF_STOCK;
    }

    const updatedProduct = await this.productRepository.update(
      id,
      dataToUpdate
    );

    if (!updatedProduct) {
      throw new Error("Producto no encontrado.");
    }

    return updatedProduct;
  }

  async delete(id) {
    const deletedProduct = await this.productRepository.delete(id);

    if (!deletedProduct) {
      throw new Error("Producto no encontrado.");
    }

    return deletedProduct;
  }
}

export default ProductService;