module.exports = (sequelize, dt) => {
	const alias = "categorias";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(50)},
	};
	const config = {
		tableName: "prod_categ1",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
