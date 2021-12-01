module.exports = (sequelize, dt) => {
	const alias = "meses";
	const columns = {
		nombre: {type: dt.STRING(20)},
	};
	const config = {
		tableName: "meses",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
