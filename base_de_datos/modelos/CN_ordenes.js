module.exports = (sequelize, dt) => {
	const alias = "ordenes";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(40)},
		valor: {type: dt.STRING(20)},
		not_null_in: {type: dt.STRING(20)},
		not_null_out: {type: dt.STRING(20)},
		ordenam: {type: dt.STRING(20)},
		ocurrio: {type: dt.STRING(2)},
	};
	const config = {
		tableName: "cn_ordenes",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
