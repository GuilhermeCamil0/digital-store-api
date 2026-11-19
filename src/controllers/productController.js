const productService = require('../services/productService');

const search = async (req, res) => {
  try {
    const result = await productService.searchProducts(req.query);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 400).json({ message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }
    return res.status(200).json(product);
  } catch (error) {
    return res.status(error.status || 400).json({ message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    return res.status(201).json(product);
  } catch (error) {
    return res.status(error.status || 400).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    await productService.updateProduct(req.params.id, req.body);
    return res.status(204).send();
  } catch (error) {
    return res.status(error.status || 400).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return res.status(error.status || 400).json({ message: error.message });
  }
};

module.exports = {
  search,
  getById,
  create,
  update,
  remove,
};