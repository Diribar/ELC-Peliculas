module.exports = (sequelize, dt) => {
	const alias = "cn_ordenes";
	const columns = {
		codigo: {type: dt.STRING(20)},
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(40)},
		valor: {type: dt.STRING(20)},
		asc_des: {type: dt.STRING(20)},
	};
	const config = {
		tableName: "cn_ordenes",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
