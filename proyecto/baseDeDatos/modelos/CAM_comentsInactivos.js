module.exports = (sequelize, dt) => {
	const alias = "comentsInactivos";
	const columns = {
		entidad: {type: dt.STRING(20)},
		entidad_id: {type: dt.INTEGER},
		comentario: {type: dt.STRING(150)},
	};
	const config = {
		tableName: "cam_coments_inactivos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
