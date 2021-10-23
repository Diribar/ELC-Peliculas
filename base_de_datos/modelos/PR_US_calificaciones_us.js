module.exports = (sequelize, dt) => {
	const alias = "calificaciones_us";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		usuario_id: { type: dt.INTEGER },
		peli_id: { type: dt.INTEGER },
		colec_id: { type: dt.INTEGER },
		fe_valores_id: { type: dt.INTEGER },
		entretiene_id: { type: dt.INTEGER },
		calidad_sonora_visual_id: { type: dt.INTEGER },
		resultado: { type: dt.INTEGER },
	};
	const config = {
		tableName: "calificaciones_us",
		timestamps: false
	}
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = n => {
		entidad.belongsTo(n.calidad_sonora_visual, {as: "calidad_sonora_visual", foreignKey: "calidad_sonora_visual_id"});
		entidad.belongsTo(n.fe_valores, {as: "fe_valores", foreignKey: "fe_valores_id"});
		entidad.belongsTo(n.entretiene, {as: "entretiene", foreignKey: "entretiene_id"});
		entidad.belongsTo(n.peliculas, {as: "pelicula", foreignKey: "peli_id"});
		entidad.belongsTo(n.colecciones, {as: "coleccion", foreignKey: "colec_id"});
		entidad.belongsTo(n.usuarios, {as: "usuario", foreignKey: "usuario_id"});
	};
	return entidad;
}