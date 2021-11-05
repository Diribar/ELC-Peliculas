module.exports = (sequelize, dt) => {
	const alias = "calificaciones_us";
	const columns = {
		usuario_id: { type: dt.INTEGER },
		peli_id: { type: dt.INTEGER },
		colec_id: { type: dt.INTEGER },
		fe_valores: { type: dt.DECIMAL },
		entretiene: { type: dt.DECIMAL },
		calidad_sonora_visual: { type: dt.DECIMAL },
		resultado: { type: dt.DECIMAL },
	};
	const config = {
		tableName: "calificaciones_us",
		timestamps: false
	}
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = n => {
		entidad.belongsTo(n.peliculas, {as: "pelicula", foreignKey: "peli_id"});
		entidad.belongsTo(n.colecciones, {as: "coleccion", foreignKey: "colec_id"});
		entidad.belongsTo(n.usuarios, {as: "usuario", foreignKey: "usuario_id"});
	};
	return entidad;
}