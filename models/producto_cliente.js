'use strict';
module.exports = (sequelize, DataTypes) => {
  var Producto_Cliente = sequelize.define('Producto_Cliente', {
    clienteId: DataTypes.INTEGER,
    productoId: DataTypes.INTEGER,
    cantidadComprados: DataTypes.INTEGER
  }, {tableName: 'producto_cliente'});
  Producto_Cliente.associate = function(models) {
    // associations can be defined here
  };
  return Producto_Cliente;
};