import ProductService from "../services/product.service.js";

class ProductController {
  constructor() {
    this.productService = new ProductService();
  }

  getAll = async(req, res)=> {
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

  getById = async (req, res)=> {
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

  create = async (req, res)=> {
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

  update = async (req, res)=> {
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

  delete = async (req, res)=> {
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