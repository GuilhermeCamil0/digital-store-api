const Sequelize = require('sequelize');
const dbConfig = require('../config/database');

const sequelize = new Sequelize(dbConfig);

const User = require('./User')(sequelize);
const Category = require('./Category')(sequelize);
const Product = require('./Product')(sequelize);
const ProductImage = require('./ProductImage')(sequelize);
const ProductOption = require('./ProductOption')(sequelize);
const ProductCategory = require('./ProductCategory')(sequelize);

const models = {
  User,
  Category,
  Product,
  ProductImage,
  ProductOption,
  ProductCategory,
};

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  Sequelize,
  ...models,
};