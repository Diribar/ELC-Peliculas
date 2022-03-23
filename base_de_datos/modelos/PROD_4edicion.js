module.exports = (sequelize, dt) => {
	const alias = "productos_edic";
	const columns = {
		elc_pelicula_id: {type: dt.INTEGER},
		elc_coleccion_id: {type: dt.INTEGER},
		elc_capitulo_id: {type: dt.INTEGER},
		temporada: {type: dt.INTEGER},
		capitulo: {type: dt.INTEGER},
		TMDB_id: {type: dt.STRING(10)},
		FA_id: {type: dt.STRING(10)},
		IMDB_id: {type: dt.STRING(10)},
		entidad_TMDB: {type: dt.STRING(10)},
		nombre_original: {type: dt.STRING(100)},
		nombre_castellano: {type: dt.STRING(100)},
		duracion: {type: dt.INTEGER},
		ano_estreno: {type: dt.INTEGER},
		ano_fin: {type: dt.INTEGER},
		paises_id: {type: dt.STRING(18)},
		idioma_original_id: {type: dt.STRING(2)},
		cant_temporadas: {type: dt.INTEGER},
		cant_capitulos: {type: dt.INTEGER},
		direccion: {type: dt.STRING(100)},
		guion: {type: dt.STRING(100)},
		musica: {type: dt.STRING(100)},
		actuacion: {type: dt.STRING(500)},
		produccion: {type: dt.STRING(100)},
		sinopsis: {type: dt.STRING(800)},
		avatar: {type: dt.STRING(100)},
		en_castellano_id: {type: dt.INTEGER},
		en_color_id: {type: dt.INTEGER},
		categoria_id: {type: dt.STRING(3)},
		subcategoria_id: {type: dt.INTEGER},
		publico_sugerido_id: {type: dt.INTEGER},
		personaje_id: {type: dt.INTEGER},
		hecho_id: {type: dt.INTEGER},
		valor_id: {type: dt.INTEGER},

		editado_por_id: {type: dt.INTEGER},
		editado_en: {type: dt.DATE},
		capturado_por_id: {type: dt.INTEGER},
		capturado_en: {type: dt.DATE},

		links_gratuitos_cargados_id: {type: dt.INTEGER},
		links_gratuitos_en_la_web_id: {type: dt.INTEGER},
	};
	const config = {
		tableName: "prod_4edicion",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.peliculas, {as: "pelicula_original", foreignKey: "elc_pelicula_id"});
		entidad.belongsTo(n.colecciones, {as: "coleccion_original", foreignKey: "elc_coleccion_id"});
		entidad.belongsTo(n.capitulos, {as: "capitulo_original", foreignKey: "elc_capitulo_id"});
		entidad.belongsTo(n.si_no_parcial, {as: "en_castellano", foreignKey: "en_castellano_id"});
		entidad.belongsTo(n.si_no_parcial, {as: "en_color", foreignKey: "en_color_id"});
		entidad.belongsTo(n.idiomas, {as: "idioma_original", foreignKey: "idioma_original_id"});
		entidad.belongsTo(n.categorias, {as: "categoria", foreignKey: "categoria_id"});
		entidad.belongsTo(n.subcategorias, {as: "subcategoria", foreignKey: "subcategoria_id"});
		entidad.belongsTo(n.publicos_sugeridos, {as: "publico_sugerido", foreignKey: "publico_sugerido_id"});
		entidad.belongsTo(n.RCLV_personajes, {as: "personaje", foreignKey: "personaje_id"});
		entidad.belongsTo(n.RCLV_hechos, {as: "hecho", foreignKey: "hecho_id"});
		entidad.belongsTo(n.RCLV_valores, {as: "valor", foreignKey: "valor_id"});

		entidad.belongsTo(n.usuarios, {as: "editado_por", foreignKey: "editado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "capturado_por", foreignKey: "capturado_por_id"});

		entidad.belongsTo(n.si_no_parcial, {as: "links_gratuitos_cargados", foreignKey: "links_gratuitos_cargados_id"});
		entidad.belongsTo(n.si_no_parcial, {as: "links_gratuitos_en_la_web", foreignKey: "links_gratuitos_en_la_web_id"});
	};
	return entidad;
};
