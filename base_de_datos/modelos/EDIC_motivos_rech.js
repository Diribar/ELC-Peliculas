module.exports = (sequelize, dt) => {
	const alias = "edic_motivos_rech";
	const columns = {
		orden: {type: dt.INTEGER},
		comentario: {type: dt.STRING(41)},
		avatar: {type: dt.BOOLEAN},
		prod: {type: dt.BOOLEAN},
		rclv: {type: dt.BOOLEAN},
		links: {type: dt.BOOLEAN},
		duracion: {type: dt.INTEGER},
		info_erronea: {type: dt.BOOLEAN},
		generico: {type: dt.BOOLEAN},
		};
	const config = {
		tableName: "edic_motivos_rech",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
