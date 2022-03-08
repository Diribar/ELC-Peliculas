module.exports = (sequelize, dt) => {
	const alias = "cal_registros";
	const columns = {
		usuario_id: {type: dt.INTEGER},
		pelicula_id: {type: dt.INTEGER},
		coleccion_id: {type: dt.INTEGER},
		capitulo_id: {type: dt.INTEGER},
		fe_valores: {type: dt.DECIMAL},
		entretiene: {type: dt.DECIMAL},
		calidad_tecnica: {type: dt.DECIMAL},
		resultado: {type: dt.DECIMAL},
		creado_en: {type: dt.DATE},
	};
	const config = {
		tableName: "cal_1registros",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.usuarios, {as: "usuario", foreignKey: "usuario_id"});
		entidad.belongsTo(n.peliculas, {as: "pelicula", foreignKey: "pelicula_id"});
		entidad.belongsTo(n.colecciones, {as: "coleccion", foreignKey: "coleccion_id"});
		entidad.belongsTo(n.capitulos, {as: "capitulo", foreignKey: "capitulo_id"});
	};
	return entidad;
};
