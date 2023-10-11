module.exports = (sequelize, dt) => {
	const alias = "meses";
	const columns = {
		nombre: {type: dt.STRING(10)},
		abrev: {type: dt.STRING(3)},
	
	};
	const config = {
		tableName: "aux_meses",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
