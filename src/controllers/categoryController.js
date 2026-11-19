const categoryService = require('../services/categoryService');

const search = async (req, res) => {
  try {
    const result = await categoryService.searchCategories(req.query);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 400).json({ message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }
    return res.status(200).json(category);
  } catch (error) {
    return res.status(error.status || 400).json({ message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const category = await categoryService.createCategory(req.body);
    return res.status(201).json(category);
  } catch (error) {
    return res.status(error.status || 400).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    await categoryService.updateCategory(req.params.id, req.body);
    return res.status(204).send();
  } catch (error) {
    return res.status(error.status || 400).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await categoryService.deleteCategory(req.params.id);
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