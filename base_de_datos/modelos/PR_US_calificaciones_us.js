module.exports = (sequelize, dt) => {
	const alias = "us_calificaciones";
	const columns = {
		usuario_id: { type: dt.INTEGER },
		pelicula_id: { type: dt.INTEGER },
		coleccion_id: { type: dt.INTEGER },
		fe_valores_id: { type: dt.INTEGER },
		entretiene_id: { type: dt.INTEGER },
		calidad_tecnica_id: { type: dt.INTEGER },
		fe_valores_valor: { type: dt.DECIMAL },
		entretiene_valor: { type: dt.DECIMAL },
		calidad_tecnica_valor: { type: dt.DECIMAL },
		resultado: { type: dt.DECIMAL },
	};
	const config = {
		tableName: "us_calificaciones",
		timestamps: false
	}
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = n => {
		entidad.belongsTo(n.usuarios, {as: "usuario", foreignKey: "usuario_id"});
		entidad.belongsTo(n.peliculas, {as: "pelicula", foreignKey: "pelicula_id"});
		entidad.belongsTo(n.colecciones, {as: "coleccion", foreignKey: "coleccion_id"});
		entidad.belongsTo(n.fe_valores, {as: "fe_valores", foreignKey: "fe_valores_id"});
		entidad.belongsTo(n.entretiene, {as: "entretiene", foreignKey: "entretiene_id"});
		entidad.belongsTo(n.calidad_tecnica, {as: "calidad_tecnica", foreignKey: "calidad_tecnica_id"});
	};
	return entidad;
}