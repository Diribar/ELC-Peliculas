module.exports = (sequelize, dt) => {
	const alias = "colecciones";
	const columns = {
		TMDB_id: {type: dt.STRING(10)},
		FA_id: {type: dt.STRING(10)},
		entidad_TMDB: {type: dt.STRING(10)},
		fuente: {type: dt.STRING(5)},
		nombre_castellano: {type: dt.STRING(100)},
		nombre_original: {type: dt.STRING(100)},
		idioma_original: {type: dt.STRING(20)},
		ano_estreno: {type: dt.INTEGER},
		ano_fin: {type: dt.INTEGER},
		cantTemporadas: {type: dt.INTEGER},
		director: {type: dt.STRING(100)},
		guion: {type: dt.STRING(100)},
		musica: {type: dt.STRING(100)},
		actores: {type: dt.STRING(500)},
		productor: {type: dt.STRING(50)},
		sinopsis: {type: dt.STRING(800)},
		avatar: {type: dt.STRING(100)},
		en_castellano_id: {type: dt.INTEGER},
		color: {type: dt.BOOLEAN},
		categoria_id: {type: dt.STRING(3)},
		subcategoria_id: {type: dt.INTEGER},
		publico_sugerido_id: {type: dt.INTEGER},
		personaje_historico_id: {type: dt.INTEGER},
		hecho_historico_id: {type: dt.INTEGER},
		link_trailer: {type: dt.STRING(200)},
		link_pelicula: {type: dt.STRING(200)},
		calificacion: {type: dt.DECIMAL},

		creada_por_id: {type: dt.INTEGER},
		creada_en: {type: dt.DATE},
		analizada_por_id: {type: dt.INTEGER},
		analizada_en: {type: dt.DATE},
		borrada_motivo_id: {type: dt.INTEGER},
		borrada_motivo_comentario: {type: dt.STRING(500)},
		lead_time_creacion: {type: dt.INTEGER},
		status_registro_id: {type: dt.INTEGER},

		editada_por_id: {type: dt.INTEGER},
		editada_en: {type: dt.DATE},
		revisada_por_id: {type: dt.INTEGER},
		revisada_en: {type: dt.DATE},
		lead_time_edicion: {type: dt.INTEGER},

		capturada_por_id: {type: dt.INTEGER},
		capturada_en: {type: dt.DATE},
	};
	const config = {
		tableName: "PROD_colecciones",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.en_castellano, {as: "en_castellano", foreignKey: "en_castellano_id"});
		entidad.belongsTo(n.categorias, {as: "categoria", foreignKey: "categoria_id"});
		entidad.belongsTo(n.subcategorias, {as: "subcategoria", foreignKey: "subcategoria_id"});
		entidad.belongsTo(n.publicos_sugeridos, {as: "publico_sugerido", foreignKey: "publico_sugerido_id"});
		entidad.belongsTo(n.historicos_personajes, {as: "personaje_historico", foreignKey: "personaje_historico_id"});
		entidad.belongsTo(n.historicos_hechos, {as: "hecho_historico", foreignKey: "hecho_historico_id"});

		entidad.belongsTo(n.usuarios, {as: "creada_por", foreignKey: "creada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "analizada_por", foreignKey: "analizada_por_id"});
		entidad.belongsTo(n.status_registro_producto, {as: "status_registro", foreignKey: "status_registro_id"});
		entidad.belongsTo(n.usuarios, {as: "editada_por", foreignKey: "editada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "revisada_por", foreignKey: "revisada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "capturada_por", foreignKey: "capturada_por_id"});
		entidad.belongsTo(n.motivos_para_borrar, {as: "borrada_motivo", foreignKey: "borrada_motivo_id"});

		entidad.hasMany(n.capitulos, {as: "capitulos",foreignKey: "coleccion_id"});
		entidad.hasMany(n.relacion_pais_prod, {as: "paises",foreignKey: "coleccion_id"});
	};
	return entidad;
};
