module.exports = (sequelize, dt) => {
	const alias = "altas_rech_motivos";
	const columns = {
		orden: {type: dt.INTEGER},
		comentario: {type: dt.STRING(41)},
		prod: {type: dt.BOOLEAN},
		rclv: {type: dt.BOOLEAN},
		links: {type: dt.BOOLEAN},
		duracion: {type: dt.INTEGER},
		};
	const config = {
		tableName: "altas_rech_motivos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
