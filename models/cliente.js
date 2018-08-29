'use strict';
module.exports = (sequelize, DataTypes) => {
  var Cliente = sequelize.define('Cliente', {
    nombre: DataTypes.STRING
  }, {tableName: 'cliente'});
  Cliente.associate = function(models) {
      Cliente.belongsToMany(models.Producto, {through: 'producto_cliente'})
  };
  return Cliente;
};