import ProductService from "../services/product.service.js";

class ProductController {
  constructor() {
    this.productService = new ProductService();

    // this.getAll = this.getAll.bind(this);
    // this.getById = this.getById.bind(this);
    // this.create = this.create.bind(this);
    // this.update = this.update.bind(this);
    // this.delete = this.delete.bind(this);
  }

  async getAll(req, res) {
    try {
      const products = await this.productService.getAll(req.query);

      return res.status(200).json({
        status: "success",
        payload: products,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async getById(req, res) {
    try {
      const product = await this.productService.getProductById(req.params.id);

      return res.status(200).json({
        status: "success",
        payload: product,
      });
    } catch (error) {
      const statusCode = error.message === "Producto no encontrado." ? 404 : 500;

      return res.status(statusCode).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async create(req, res) {
    try {
      const product = await this.productService.create(req.body);

      return res.status(201).json({
        status: "success",
        message: "Producto creado correctamente.",
        payload: product,
      });
    } catch (error) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const product = await this.productService.update(
        req.params.id,
        req.body
      );

      return res.status(200).json({
        status: "success",
        message: "Producto actualizado correctamente.",
        payload: product,
      });
    } catch (error) {
      const statusCode = error.message === "Producto no encontrado." ? 404 : 400;

      return res.status(statusCode).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const product = await this.productService.delete(req.params.id);

      return res.status(200).json({
        status: "success",
        message: "Producto eliminado correctamente.",
        payload: product,
      });
    } catch (error) {
      const statusCode = error.message === "Producto no encontrado." ? 404 : 500;

      return res.status(statusCode).json({
        status: "error",
        message: error.message,
      });
    }
  }
}

export default ProductController;