module.exports = (sequelize, dt) => {
	const alias = "comentsInactivos";
	const columns = {
		pelicula_id: {type: dt.INTEGER},
		coleccion_id: {type: dt.INTEGER},
		grupoCol_id: {type: dt.INTEGER},
		capitulo_id: {type: dt.INTEGER},

		comentario: {type: dt.STRING(150)},
	};
	const config = {
		tableName: "cam_coment_inactivos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.peliculas, {as: "pelicula", foreignKey: "pelicula_id"});
		entidad.belongsTo(n.colecciones, {as: "coleccion", foreignKey: "coleccion_id"});
		entidad.belongsTo(n.colecciones, {as: "grupoCol", foreignKey: "grupoCol_id"});
		entidad.belongsTo(n.capitulos, {as: "capitulo", foreignKey: "capitulo_id"});
	};
	return entidad;
};
