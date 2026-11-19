const { Op } = require('sequelize');
const {
  sequelize,
  Product,
  Category,
  ProductImage,
  ProductOption,
} = require('../models');

// Formata o produto no padrão exato exigido pelo README
const formatProduct = (product, requestedFields = null) => {
  const plain = product.get ? product.get({ plain: true }) : product;

  const formatted = {
    id: plain.id,
    enabled: plain.enabled,
    name: plain.name,
    slug: plain.slug,
    stock: plain.stock,
    description: plain.description,
    price: plain.price,
    price_with_discount: plain.price_with_discount,
    category_ids: plain.categories ? plain.categories.map((c) => c.id) : [],
    images: plain.images
      ? plain.images.map((img) => ({ id: img.id, content: img.path }))
      : [],
    options: plain.options
      ? plain.options.map((opt) => ({
          id: opt.id,
          title: opt.title,
          shape: opt.shape,
          radius: opt.radius,
          type: opt.type,
          values: opt.values ? opt.values.split(',') : [],
        }))
      : [],
  };

  if (requestedFields && requestedFields.length > 0) {
    const filtered = {};
    requestedFields.forEach((field) => {
      if (formatted[field] !== undefined) {
        filtered[field] = formatted[field];
      }
    });
    return filtered;
  }

  return formatted;
};

const searchProducts = async (query) => {
  const limit = query.limit !== undefined ? parseInt(query.limit, 10) : 12;
  const page = query.page !== undefined ? parseInt(query.page, 10) : 1;

  if (Number.isNaN(limit) || Number.isNaN(page) || page < 1) {
    throw { status: 400, message: 'Parâmetros de paginação inválidos.' };
  }

  const where = {};

  // Filtro por termo no nome ou descrição (match=Tênis)
  if (query.match) {
    where[Op.or] = [
      { name: { [Op.like]: `%${query.match}%` } },
      { description: { [Op.like]: `%${query.match}%` } },
    ];
  }

  // Filtro por faixa de preço (price-range=100-200)
  if (query['price-range']) {
    const parts = query['price-range'].split('-').map(Number);
    if (parts.length !== 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) {
      throw { status: 400, message: 'Formato inválido para price-range. Use min-max.' };
    }
    where.price = { [Op.between]: [parts[0], parts[1]] };
  }

  const include = [
    { model: ProductImage, as: 'images' },
    { model: ProductOption, as: 'options' },
    { model: Category, as: 'categories', through: { attributes: [] } },
  ];

  // Filtro por categorias (category_ids=15,24)
  if (query.category_ids) {
    const ids = query.category_ids.split(',').map((id) => parseInt(id.trim(), 10));
    if (ids.some(Number.isNaN)) {
      throw { status: 400, message: 'category_ids inválido.' };
    }
    include[2].where = { id: { [Op.in]: ids } };
    include[2].required = true;
  }

  // Filtro por opções (option[45]=GG,PP)
  if (query.option && typeof query.option === 'object') {
    const optionFilters = Object.entries(query.option);
    if (optionFilters.length > 0) {
      const [optId, rawValues] = optionFilters[0];
      const valuesList = String(rawValues).split(',').map((v) => v.trim());
      include[1].where = {
        id: parseInt(optId, 10),
        [Op.or]: valuesList.map((val) => ({
          values: { [Op.like]: `%${val}%` },
        })),
      };
      include[1].required = true;
    }
  }

  let requestedFields = null;
  if (query.fields) {
    requestedFields = query.fields.split(',').map((f) => f.trim());
  }

  const findOptions = {
    where,
    include,
    distinct: true,
  };

  if (limit !== -1) {
    findOptions.limit = limit;
    findOptions.offset = (page - 1) * limit;
  }

  const { count, rows } = await Product.findAndCountAll(findOptions);

  return {
    data: rows.map((p) => formatProduct(p, requestedFields)),
    total: count,
    limit,
    page: limit === -1 ? 1 : page,
  };
};

const getProductById = async (id) => {
  const product = await Product.findByPk(id, {
    include: [
      { model: ProductImage, as: 'images' },
      { model: ProductOption, as: 'options' },
      { model: Category, as: 'categories', through: { attributes: [] } },
    ],
  });

  if (!product) return null;
  return formatProduct(product);
};

const createProduct = async (payload) => {
  const {
    enabled = false,
    name,
    slug,
    use_in_menu = false,
    stock = 0,
    description = '',
    price,
    price_with_discount,
    category_ids = [],
    images = [],
    options = [],
  } = payload;

  if (!name || !slug || price === undefined || price_with_discount === undefined) {
    throw {
      status: 400,
      message: 'Os campos name, slug, price e price_with_discount são obrigatórios.',
    };
  }

  const transaction = await sequelize.transaction();
  try {
    const product = await Product.create(
      {
        enabled,
        name,
        slug,
        use_in_menu,
        stock,
        description,
        price,
        price_with_discount,
      },
      { transaction }
    );

    if (category_ids.length > 0) {
      await product.setCategories(category_ids, { transaction });
    }

    if (images.length > 0) {
      const imageRecords = images.map((img) => ({
        product_id: product.id,
        enabled: true,
        path: img.content || img.path,
      }));
      await ProductImage.bulkCreate(imageRecords, { transaction });
    }

    if (options.length > 0) {
      const optionRecords = options.map((opt) => ({
        product_id: product.id,
        title: opt.title,
        shape: opt.shape || 'square',
        radius: opt.radius ? parseInt(opt.radius, 10) || 0 : 0,
        type: opt.type || 'text',
        values: Array.isArray(opt.values)
          ? opt.values.join(',')
          : String(opt.values || opt.value || ''),
      }));
      await ProductOption.bulkCreate(optionRecords, { transaction });
    }

    await transaction.commit();
    return getProductById(product.id);
  } catch (error) {
    await transaction.rollback();
    throw { status: 400, message: error.message || 'Erro ao criar produto.' };
  }
};

const updateProduct = async (id, payload) => {
  const product = await Product.findByPk(id);
  if (!product) {
    throw { status: 404, message: 'Produto não encontrado.' };
  }

  const {
    enabled,
    name,
    slug,
    use_in_menu,
    stock,
    description,
    price,
    price_with_discount,
    category_ids,
    images,
    options,
  } = payload;

  const transaction = await sequelize.transaction();
  try {
    await product.update(
      {
        ...(enabled !== undefined && { enabled }),
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(use_in_menu !== undefined && { use_in_menu }),
        ...(stock !== undefined && { stock }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(price_with_discount !== undefined && { price_with_discount }),
      },
      { transaction }
    );

    if (Array.isArray(category_ids)) {
      await product.setCategories(category_ids, { transaction });
    }

    if (Array.isArray(images)) {
      for (const img of images) {
        if (img.id && img.deleted) {
          await ProductImage.destroy({
            where: { id: img.id, product_id: product.id },
            transaction,
          });
        } else if (img.id && img.content) {
          await ProductImage.update(
            { path: img.content },
            { where: { id: img.id, product_id: product.id }, transaction }
          );
        } else if (!img.id && img.content) {
          await ProductImage.create(
            { product_id: product.id, enabled: true, path: img.content },
            { transaction }
          );
        }
      }
    }

    if (Array.isArray(options)) {
      for (const opt of options) {
        const rawVals = opt.values || opt.value;
        const formattedValues = Array.isArray(rawVals)
          ? rawVals.join(',')
          : rawVals !== undefined
          ? String(rawVals)
          : undefined;

        if (opt.id && opt.deleted) {
          await ProductOption.destroy({
            where: { id: opt.id, product_id: product.id },
            transaction,
          });
        } else if (opt.id) {
          await ProductOption.update(
            {
              ...(opt.title !== undefined && { title: opt.title }),
              ...(opt.shape !== undefined && { shape: opt.shape }),
              ...(opt.radius !== undefined && {
                radius: parseInt(opt.radius, 10) || 0,
              }),
              ...(opt.type !== undefined && { type: opt.type }),
              ...(formattedValues !== undefined && { values: formattedValues }),
            },
            { where: { id: opt.id, product_id: product.id }, transaction }
          );
        } else if (opt.title) {
          await ProductOption.create(
            {
              product_id: product.id,
              title: opt.title,
              shape: opt.shape || 'square',
              radius: opt.radius ? parseInt(opt.radius, 10) || 0 : 0,
              type: opt.type || 'text',
              values: formattedValues || '',
            },
            { transaction }
          );
        }
      }
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw { status: 400, message: error.message || 'Erro ao atualizar produto.' };
  }
};

const deleteProduct = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) {
    throw { status: 404, message: 'Produto não encontrado.' };
  }
  await product.destroy();
};

module.exports = {
  searchProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};