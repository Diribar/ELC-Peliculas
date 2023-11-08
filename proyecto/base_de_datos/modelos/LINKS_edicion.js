module.exports = (sequelize, dt) => {
	const alias = "linksEdicion";
	const columns = {
		link_id: {type: dt.INTEGER},
		pelicula_id: {type: dt.INTEGER},
		coleccion_id: {type: dt.INTEGER},
		capitulo_id: {type: dt.INTEGER},

		calidad: {type: dt.INTEGER},
		castellano: {type: dt.BOOLEAN},
		subtitulos: {type: dt.BOOLEAN},
		gratuito: {type: dt.BOOLEAN},
		tipo_id: {type: dt.INTEGER},
		completo: {type: dt.INTEGER},
		parte: {type: dt.INTEGER},

		editadoPor_id: {type: dt.INTEGER},
		editadoEn: {type: dt.DATE},
	};
	const config = {
		tableName: "links_edicion",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.links, {as: "link", foreignKey: "link_id"});

		entidad.belongsTo(n.peliculas, {as: "pelicula", foreignKey: "pelicula_id"});
		entidad.belongsTo(n.colecciones, {as: "coleccion", foreignKey: "coleccion_id"});
		entidad.belongsTo(n.capitulos, {as: "capitulo", foreignKey: "capitulo_id"});

		entidad.belongsTo(n.linksTipos, {as: "tipo", foreignKey: "tipo_id"});

		entidad.belongsTo(n.usuarios, {as: "editadoPor", foreignKey: "editadoPor_id"});
	};
	return entidad;
};
