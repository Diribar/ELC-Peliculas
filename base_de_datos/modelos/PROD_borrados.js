module.exports = (sequelize, dt) => {
	const alias = "PROD_borrados";
	const columns = {
		pelicula_id: {type: dt.INTEGER},
		coleccion_id: {type: dt.INTEGER},
		capitulo_id: {type: dt.INTEGER},
		motivo_id: {type: dt.INTEGER},
		comentario: {type: dt.STRING(50)},
	};
	const config = {
		tableName: "PROD_borrados",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.peliculas, {as: "pelicula", foreignKey: "pelicula_id"});
		entidad.belongsTo(n.colecciones, {as: "coleccion", foreignKey: "coleccion_id"});
		entidad.belongsTo(n.capitulos, {as: "capitulo", foreignKey: "capitulo_id"});
		entidad.belongsTo(n.PROD_borrar_motivos, {as: "motivo", foreignKey: "motivo_id"});
	};
	return entidad;
};
