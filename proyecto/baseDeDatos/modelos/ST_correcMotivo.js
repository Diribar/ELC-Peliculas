module.exports = (sequelize, dt) => {
	const alias = "correcMotivo";
	const columns = {
		entidad: {type: dt.STRING(20)},
		entidad_id: {type: dt.INTEGER},
		nombre: {type: dt.STRING(35)},
	};
	const config = {
		tableName: "st_correc_motivo",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
