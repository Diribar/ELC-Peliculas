module.exports = (sequelize, dt) => {
	const alias = "edic_rech_motivos";
	const columns = {
		orden: {type: dt.INTEGER},
		comentario: {type: dt.STRING(41)},
		avatar: {type: dt.BOOLEAN},
		prod: {type: dt.BOOLEAN},
		rclv: {type: dt.BOOLEAN},
		links: {type: dt.BOOLEAN},
		duracion: {type: dt.INTEGER},
		info_erronea: {type: dt.BOOLEAN},
		};
	const config = {
		tableName: "edic_rech_motivos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
