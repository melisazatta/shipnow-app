import ProductRepository from "../repositories/product.repository.js";
import { PRODUCT_STATUS } from "../constants/index.js";
import { ErrorDictionary, createError } from "../utils/errors.js";

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
      throw createError(ErrorDictionary.PRODUCT_NOT_FOUND)
    }

    return product;
  }

  async create(productData) {
    const { name, description, price, stock } = productData;

    if (!name || price === undefined || stock === undefined) {
      throw createError(ErrorDictionary.MISSING_REQUIRED_FIELDS)
    }

     if (typeof price !== "number" || Number.isNaN(price) || price < 0) { throw createError(ErrorDictionary.INVALID_PRICE) }

     if (typeof stock !== "number" || Number.isNaN(stock) || stock < 0) { throw createError(ErrorDictionary.INVALID_STOCK) }

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
    
    if (price !== undefined && (typeof price !== "number" || Number.isNaN(price) || price < 0)) {
    throw createError(ErrorDictionary.INVALID_PRICE)
    }

    if (stock !== undefined && (typeof stock !== "number" || Number.isNaN(stock) || stock < 0)) {
    throw createError(ErrorDictionary.INVALID_STOCK)
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
      throw createError(ErrorDictionary.PRODUCT_NOT_FOUND)
    }

    return updatedProduct;
  }

  async delete(id) {
    const deletedProduct = await this.productRepository.delete(id);

    if (!deletedProduct) {
      throw createError(ErrorDictionary.PRODUCT_NOT_FOUND)
    }

    return deletedProduct;
  }
}

export default ProductService;