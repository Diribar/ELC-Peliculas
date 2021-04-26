const Sequelize = require("sequelize");

module.exports = (sequelize) => {
    const alias = "Categoria";
    const columns = {
        nombre: Sequelize.STRING(500)
    };
    const config = {
        tableName: "categorias",
        timestamps: false
    };

    const Categoria = sequelize.define(alias,columns,config);

    Categoria.associate = function(models) {
        Categoria.hasMany(models.Producto, {
            as: "productos",
            foreignKey: "categoria_id"
        });
    };

    return Categoria;
};
