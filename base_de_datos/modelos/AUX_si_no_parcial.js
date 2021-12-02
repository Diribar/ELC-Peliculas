module.exports = (sequelize, dt) => {
	const alias = "si_no_parcial";
	const columns = {
		nombre: {type: dt.STRING(10)},
	};
	const config = {
		tableName: "si_no_parcial",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
