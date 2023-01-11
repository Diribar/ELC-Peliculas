module.exports = (sequelize, dt) => {
	const alias = "prods_edicion";
	const columns = {
		pelicula_id: {type: dt.INTEGER},
		coleccion_id: {type: dt.INTEGER},
		capitulo_id: {type: dt.INTEGER},
		nombre_original: {type: dt.STRING(70)},
		nombre_castellano: {type: dt.STRING(70)},
		duracion: {type: dt.INTEGER},
		ano_estreno: {type: dt.INTEGER},
		ano_fin: {type: dt.INTEGER},
		paises_id: {type: dt.STRING(14)},
		idioma_original_id: {type: dt.STRING(2)},
		direccion: {type: dt.STRING(100)},
		guion: {type: dt.STRING(100)},
		musica: {type: dt.STRING(100)},
		actores: {type: dt.STRING(500)},
		produccion: {type: dt.STRING(100)},
		sinopsis: {type: dt.STRING(900)},
		avatar: {type: dt.STRING(18)},
		avatar_url: {type: dt.STRING(100)},

		en_color_id: {type: dt.INTEGER},
		categoria_id: {type: dt.STRING(3)},
		subcategoria_id: {type: dt.STRING(3)},
		publico_sugerido_id: {type: dt.INTEGER},

		personaje_id: {type: dt.INTEGER},
		hecho_id: {type: dt.INTEGER},
		valor_id: {type: dt.INTEGER},

		editado_por_id: {type: dt.INTEGER},
		editado_en: {type: dt.DATE},
	};
	const config = {
		tableName: "prod_4edicion",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.peliculas, {as: "pelicula", foreignKey: "pelicula_id"});
		entidad.belongsTo(n.colecciones, {as: "coleccion", foreignKey: "coleccion_id"});
		entidad.belongsTo(n.capitulos, {as: "capitulo", foreignKey: "capitulo_id"});

		entidad.belongsTo(n.si_no_parcial, {as: "en_castellano", foreignKey: "en_castellano_id"});
		entidad.belongsTo(n.si_no_parcial, {as: "en_color", foreignKey: "en_color_id"});
		entidad.belongsTo(n.idiomas, {as: "idioma_original", foreignKey: "idioma_original_id"});
		entidad.belongsTo(n.categorias, {as: "categoria", foreignKey: "categoria_id"});
		entidad.belongsTo(n.subcategorias, {as: "subcategoria", foreignKey: "subcategoria_id"});
		entidad.belongsTo(n.publicos_sugeridos, {as: "publico_sugerido", foreignKey: "publico_sugerido_id"});

		entidad.belongsTo(n.personajes, {as: "personaje", foreignKey: "personaje_id"});
		entidad.belongsTo(n.hechos, {as: "hecho", foreignKey: "hecho_id"});
		entidad.belongsTo(n.valores, {as: "valor", foreignKey: "valor_id"});

		entidad.belongsTo(n.usuarios, {as: "editado_por", foreignKey: "editado_por_id"});
	};
	return entidad;
};
