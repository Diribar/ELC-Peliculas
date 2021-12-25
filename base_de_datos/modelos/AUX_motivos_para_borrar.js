module.exports = (sequelize, dt) => {
	const alias = "motivos_para_borrar";
	const columns = {
		nombre: {type: dt.STRING(20)},
		productos: {type: dt.BOOLEAN},
		RCLV: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "motivos_para_borrar",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.RCLV_personajes_historicos, {as: "aplicado_a_personajes_historicos", foreignKey: "borrada_motivo_id"});
		entidad.hasMany(n.RCLV_hechos_historicos, {as: "aplicado_a_hechos_historicos", foreignKey: "borrada_motivo_id"});
		entidad.hasMany(n.RCLV_valores, {as: "aplicado_a_valores", foreignKey: "borrada_motivo_id"});
		entidad.hasMany(n.colecciones, {as: "aplicado_a_colecciones", foreignKey: "borrada_motivo_id"});
		entidad.hasMany(n.peliculas, {as: "aplicado_a_peliculas", foreignKey: "borrada_motivo_id"});
	};
	return entidad;
};
