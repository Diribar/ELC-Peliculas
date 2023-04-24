module.exports = (sequelize, dt) => {
	const alias = "peliculas";
	const columns = {
		fuente: {type: dt.STRING(5)},
		TMDB_id: {type: dt.STRING(10)},
		FA_id: {type: dt.STRING(10)},
		IMDB_id: {type: dt.STRING(10)},
		nombre_original: {type: dt.STRING(70)},
		nombre_castellano: {type: dt.STRING(70)},
		ano_estreno: {type: dt.INTEGER},
		duracion: {type: dt.INTEGER},
		paises_id: {type: dt.STRING(14)},
		idioma_original_id: {type: dt.STRING(2)},
		direccion: {type: dt.STRING(100)},
		guion: {type: dt.STRING(100)},
		musica: {type: dt.STRING(100)},
		actores: {type: dt.STRING(500)},
		produccion: {type: dt.STRING(100)},
		sinopsis: {type: dt.STRING(1004)},
		avatar: {type: dt.STRING(100)},

		cfc: {type: dt.BOOLEAN},
		ocurrio: {type: dt.BOOLEAN},
		musical: {type: dt.BOOLEAN},
		color: {type: dt.BOOLEAN},
		tipo_actuacion_id: {type: dt.INTEGER},
		publico_id: {type: dt.INTEGER},

		personaje_id: {type: dt.INTEGER},
		hecho_id: {type: dt.INTEGER},
		tema_id: {type: dt.INTEGER},
		evento_id: {type: dt.INTEGER},
		epoca_del_ano_id: {type: dt.INTEGER},

		castellano: {type: dt.INTEGER},
		subtitulos: {type: dt.INTEGER},
		links_general: {type: dt.INTEGER},
		links_gratuitos: {type: dt.INTEGER},

		fe_valores: {type: dt.INTEGER},
		entretiene: {type: dt.INTEGER},
		calidad_tecnica: {type: dt.INTEGER},
		calificacion: {type: dt.INTEGER},

		momento: {type: dt.INTEGER},

		creado_por_id: {type: dt.INTEGER},
		creado_en: {type: dt.DATE},
		alta_revisada_por_id: {type: dt.INTEGER},
		alta_revisada_en: {type: dt.DATE},
		alta_term_en: {type: dt.DATE},
		lead_time_creacion: {type: dt.DECIMAL},

		editado_por_id: {type: dt.INTEGER},
		editado_en: {type: dt.DATE},
		edic_revisada_por_id: {type: dt.INTEGER},
		edic_revisada_en: {type: dt.DATE},
		lead_time_edicion: {type: dt.DECIMAL},

		status_registro_id: {type: dt.INTEGER},
		motivo_id: {type: dt.INTEGER},
		sugerido_por_id: {type: dt.INTEGER},
		sugerido_en: {type: dt.DATE},

		capturado_por_id: {type: dt.INTEGER},
		capturado_en: {type: dt.DATE},
		captura_activa: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "prod_1peliculas",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.idiomas, {as: "idioma_original", foreignKey: "idioma_original_id"});
		entidad.belongsTo(n.tipos_actuacion, {as: "tipo_actuacion", foreignKey: "tipo_actuacion_id"});
		entidad.belongsTo(n.publicos, {as: "publico", foreignKey: "publico_id"});

		entidad.belongsTo(n.personajes, {as: "personaje", foreignKey: "personaje_id"});
		entidad.belongsTo(n.hechos, {as: "hecho", foreignKey: "hecho_id"});
		entidad.belongsTo(n.temas, {as: "tema", foreignKey: "tema_id"});
		entidad.belongsTo(n.eventos, {as: "evento", foreignKey: "evento_id"});
		entidad.belongsTo(n.epocas_del_ano, {as: "epoca_del_ano", foreignKey: "epoca_del_ano_id"});

		entidad.belongsTo(n.usuarios, {as: "creado_por", foreignKey: "creado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "alta_revisada_por", foreignKey: "alta_revisada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "editado_por", foreignKey: "editado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "edic_revisada_por", foreignKey: "edic_revisada_por_id"});

		entidad.belongsTo(n.status_registros, {as: "status_registro", foreignKey: "status_registro_id"});
		entidad.belongsTo(n.motivos_rech_altas, {as: "motivo", foreignKey: "motivo_id"});
		entidad.belongsTo(n.usuarios, {as: "sugerido_por", foreignKey: "sugerido_por_id"});
		entidad.belongsTo(n.usuarios, {as: "capturado_por", foreignKey: "capturado_por_id"});

		entidad.hasMany(n.prods_edicion, {as: "ediciones", foreignKey: "pelicula_id"});
		entidad.hasMany(n.links, {as: "links", foreignKey: "pelicula_id"});
		entidad.hasMany(n.links_edicion, {as: "links_edic", foreignKey: "pelicula_id"});
	};
	return entidad;
};
