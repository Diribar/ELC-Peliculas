module.exports = (sequelize, dt) => {
	const alias = "ordenes";
	const columns = {
		entidad: {type: dt.STRING(20)},
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
