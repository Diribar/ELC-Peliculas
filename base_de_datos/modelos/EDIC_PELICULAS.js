module.exports = (sequelize, dt) => {
	const alias = "peliculasEdicion";
	const columns = {
		ELC_id: {type: dt.INTEGER},
		TMDB_id: {type: dt.STRING(10)},
		FA_id: {type: dt.STRING(10)},
		IMDB_id: {type: dt.STRING(10)},
		nombre_castellano: {type: dt.STRING(100)},
		nombre_original: {type: dt.STRING(100)},
		idioma_original_id: {type: dt.STRING(2)},
		duracion: {type: dt.INTEGER},
		paises_id: {type: dt.STRING(18)},
		ano_estreno: {type: dt.INTEGER},
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
		personaje_historico_id: {type: dt.INTEGER},
		hecho_historico_id: {type: dt.INTEGER},
		valor_id: {type: dt.INTEGER},
		link_trailer: {type: dt.STRING(200)},
		link_pelicula: {type: dt.STRING(200)},

		editada_por_id: {type: dt.INTEGER},
		editada_en: {type: dt.DATE},
		status_registro_id: {type: dt.INTEGER},

		capturada_por_id: {type: dt.INTEGER},
		capturada_en: {type: dt.DATE},
	};
	const config = {
		tableName: "edic_peliculas",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.si_no_parcial, {as: "en_castellano", foreignKey: "en_castellano_id"});
		entidad.belongsTo(n.si_no_parcial, {as: "en_color", foreignKey: "en_color_id"});
		entidad.belongsTo(n.idiomas, {as: "idioma_original", foreignKey: "idioma_original_id"});
		entidad.belongsTo(n.categorias, {as: "categoria", foreignKey: "categoria_id"});
		entidad.belongsTo(n.subcategorias, {as: "subcategoria", foreignKey: "subcategoria_id"});
		entidad.belongsTo(n.publicos_sugeridos, {as: "publico_sugerido", foreignKey: "publico_sugerido_id"});
		entidad.belongsTo(n.RCLV_personajes_historicos, {as: "personaje_historico", foreignKey: "personaje_historico_id"});
		entidad.belongsTo(n.RCLV_hechos_historicos, {as: "hecho_historico", foreignKey: "hecho_historico_id"});
		entidad.belongsTo(n.RCLV_valores, {as: "valor", foreignKey: "valor_id"});

		entidad.belongsTo(n.usuarios, {as: "editada_por", foreignKey: "editada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "capturada_por", foreignKey: "capturada_por_id"});
		entidad.belongsTo(n.status_registro_prod, {as: "status_registro", foreignKey: "status_registro_id"});

	};
	return entidad;
};
