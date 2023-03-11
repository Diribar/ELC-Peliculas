module.exports = (sequelize, dt) => {
	const alias = "motivos_rech_edic";
	const columns = {
		orden: {type: dt.INTEGER},
		descripcion: {type: dt.STRING(40)},
		avatar_prods: {type: dt.BOOLEAN},
		avatar_rclvs: {type: dt.BOOLEAN},
		avatar_us: {type: dt.BOOLEAN},
		prods: {type: dt.BOOLEAN},
		rclvs: {type: dt.BOOLEAN},
		links: {type: dt.BOOLEAN},
		info_erronea: {type: dt.BOOLEAN},
		version_actual: {type: dt.BOOLEAN},
		duracion: {type: dt.DECIMAL},
		bloqueoInput: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "motivos_rech_edic",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	// entidad.associate = (n) => {
	// 	entidad.hasMany(n.links, {as: "edicsRech", foreignKey: "motivo_id"});
	// };
	return entidad;
};
