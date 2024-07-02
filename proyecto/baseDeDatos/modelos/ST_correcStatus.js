module.exports = (sequelize, dt) => {
	const alias = "correcStatus";
	const columns = {
		entidad: {type: dt.STRING(20)},
		entidad_id: {type: dt.INTEGER},
	};
	const config = {
		tableName: "st_correc_status",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
