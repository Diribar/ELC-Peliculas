module.exports = (sequelize, dt) => {
	const alias = "layouts";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(40)},
		valor: {type: dt.STRING(20)},
		not_null_out: {type: dt.STRING(20)},
		ocurrio: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "cn_layouts",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
