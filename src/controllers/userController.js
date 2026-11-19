const userService = require('../services/userService');

const getById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(error.status || 400).json({ message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    return res.status(201).json(user);
  } catch (error) {
    return res.status(error.status || 400).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    await userService.updateUser(req.params.id, req.body);
    return res.status(204).send();
  } catch (error) {
    return res.status(error.status || 400).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return res.status(error.status || 400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const result = await userService.generateToken(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 400).json({ message: error.message });
  }
};

module.exports = {
  getById,
  create,
  update,
  remove,
  login,
};