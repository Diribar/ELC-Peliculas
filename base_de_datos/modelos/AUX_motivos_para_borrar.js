module.exports = (sequelize, dt) => {
	const alias = "motivos_para_borrar";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		nombre: { type: dt.STRING(20) },
		productos: { type: dt.BOOLEAN },
		personajes_historicos: { type: dt.BOOLEAN },
		hechos_historicos: { type: dt.BOOLEAN },
	};
	const config = {
		tableName: "motivos_para_borrar",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = n => {
		entidad.hasMany(n.hechos_historicos, {as: "aplicado_a_hechos_historicos",foreignKey: "borrada_motivo_id"});
		entidad.hasMany(n.personajes_historicos, {as: "aplicado_a_personajes_historicos",foreignKey: "borrada_motivo_id"});
		entidad.hasMany(n.colecciones, {as: "aplicado_a_colecciones",foreignKey: "borrada_motivo_id"});
		entidad.hasMany(n.peliculas, {as: "aplicado_a_peliculas",foreignKey: "borrada_motivo_id"});
	}
	return entidad;
};
