'use strict';
module.exports = (sequelize, DataTypes) => {
  var Producto = sequelize.define('Producto', {
    nombre: DataTypes.STRING,
    categoriaId: DataTypes.INTEGER,
    stock: DataTypes.INTEGER
  }, {tableName: 'producto'});
  Producto.associate = function(models) {
      Producto.belongsTo(models.Categoria, {as: 'Categoria'})
      Producto.belongsToMany(models.Cliente, {through: 'producto_cliente'})
  };
  return Producto;
};