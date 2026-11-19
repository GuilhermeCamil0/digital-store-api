const { Category } = require('../models');

const searchCategories = async (query) => {
  const limit = query.limit !== undefined ? parseInt(query.limit, 10) : 12;
  const page = query.page !== undefined ? parseInt(query.page, 10) : 1;

  if (Number.isNaN(limit) || Number.isNaN(page) || page < 1) {
    throw { status: 400, message: 'Parâmetros de paginação inválidos.' };
  }

  const where = {};
  if (query.use_in_menu !== undefined) {
    if (query.use_in_menu !== 'true' && query.use_in_menu !== 'false') {
      throw { status: 400, message: 'Parâmetro use_in_menu deve ser true ou false.' };
    }
    where.use_in_menu = query.use_in_menu === 'true';
  }

  let attributes = ['id', 'name', 'slug', 'use_in_menu'];
  if (query.fields) {
    const allowedFields = ['id', 'name', 'slug', 'use_in_menu'];
    const requestedFields = query.fields.split(',').map((f) => f.trim());
    const invalidFields = requestedFields.filter((f) => !allowedFields.includes(f));

    if (invalidFields.length > 0) {
      throw { status: 400, message: `Campos inválidos: ${invalidFields.join(', ')}` };
    }
    attributes = requestedFields;
  }

  const options = {
    where,
    attributes,
  };

  if (limit !== -1) {
    options.limit = limit;
    options.offset = (page - 1) * limit;
  }

  const { count, rows } = await Category.findAndCountAll(options);

  return {
    data: rows,
    total: count,
    limit,
    page: limit === -1 ? 1 : page,
  };
};

const getCategoryById = async (id) => {
  return Category.findByPk(id, {
    attributes: ['id', 'name', 'slug', 'use_in_menu'],
  });
};

const createCategory = async ({ name, slug, use_in_menu = false }) => {
  if (!name || !slug) {
    throw { status: 400, message: 'Os campos name e slug são obrigatórios.' };
  }

  const category = await Category.create({
    name,
    slug,
    use_in_menu,
  });

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    use_in_menu: category.use_in_menu,
  };
};

const updateCategory = async (id, { name, slug, use_in_menu }) => {
  if (!name || !slug) {
    throw { status: 400, message: 'Os campos name e slug são obrigatórios.' };
  }

  const category = await Category.findByPk(id);
  if (!category) {
    throw { status: 404, message: 'Categoria não encontrada.' };
  }

  await category.update({
    name,
    slug,
    ...(use_in_menu !== undefined ? { use_in_menu } : {}),
  });
};

const deleteCategory = async (id) => {
  const category = await Category.findByPk(id);
  if (!category) {
    throw { status: 404, message: 'Categoria não encontrada.' };
  }

  await category.destroy();
};

module.exports = {
  searchCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};