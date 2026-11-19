const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const getUserById = async (id) => {
  return User.findByPk(id, {
    attributes: ['id', 'firstname', 'surname', 'email'],
  });
};

const createUser = async ({ firstname, surname, email, password, confirmPassword }) => {
  if (!firstname || !surname || !email || !password || !confirmPassword) {
    throw { status: 400, message: 'Todos os campos são obrigatórios.' };
  }

  if (password !== confirmPassword) {
    throw { status: 400, message: 'As senhas não coincidem.' };
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw { status: 400, message: 'E-mail já cadastrado.' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    firstname,
    surname,
    email,
    password: hashedPassword,
  });

  return {
    id: user.id,
    firstname: user.firstname,
    surname: user.surname,
    email: user.email,
  };
};

const updateUser = async (id, { firstname, surname, email }) => {
  if (!firstname || !surname || !email) {
    throw { status: 400, message: 'Campos firstname, surname e email são obrigatórios.' };
  }

  const user = await User.findByPk(id);
  if (!user) {
    throw { status: 404, message: 'Usuário não encontrado.' };
  }

  await user.update({ firstname, surname, email });
};

const deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw { status: 404, message: 'Usuário não encontrado.' };
  }

  await user.destroy();
};

const generateToken = async ({ email, password }) => {
  if (!email || !password) {
    throw { status: 400, message: 'E-mail e senha são obrigatórios.' };
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw { status: 400, message: 'Credenciais inválidas.' };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw { status: 400, message: 'Credenciais inválidas.' };
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return { token };
};

module.exports = {
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  generateToken,
};