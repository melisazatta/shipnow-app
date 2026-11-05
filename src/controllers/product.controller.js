import ProductService from "../services/product.service.js";

class ProductController {
  constructor() {
    this.productService = new ProductService();
  }

  getAll = async(req, res, next)=> {
    try {
      const products = await this.productService.getAll(req.query);

      return res.status(200).json({
        status: "success",
        payload: products,
      });
    } catch (error) { 
            next(error) 
        }
  }

  getById = async (req, res, next)=> {
    try {
      const product = await this.productService.getProductById(req.params.id);

      return res.status(200).json({
        status: "success",
        payload: product,
      });
    } catch (error) { 
            next(error) 
        }
  }

  create = async (req, res, next)=> {
    try {
      const product = await this.productService.create(req.body);

      return res.status(201).json({
        status: "success",
        message: "Producto creado correctamente.",
        payload: product,
      });
    } catch (error) { 
            next(error) 
        }
  }

  update = async (req, res, next)=> {
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
            next(error) 
        }
  }

  delete = async (req, res, next)=> {
    try {
      const product = await this.productService.delete(req.params.id);

      return res.status(200).json({
        status: "success",
        message: "Producto eliminado correctamente.",
        payload: product,
      });
    } catch (error) { 
            next(error) 
        }
  }
}

export default ProductController;