module.exports = (sequelize, dt) => {
	const alias = "si_no_parcial";
	const columns = {
		productos: {type: dt.STRING(10)},
		links: {type: dt.STRING(10)},
		si: {type: dt.BOOLEAN},
		no: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "prod_si_no_parcial",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
