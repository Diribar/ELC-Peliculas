module.exports = (sequelize, dt) => {
	const alias = "peliculas";
	const columns = {
		TMDB_id: {type: dt.STRING(10)},
		FA_id: {type: dt.STRING(10)},
		IMDB_id: {type: dt.STRING(10)},
		fuente: {type: dt.STRING(5)},
		nombre_castellano: {type: dt.STRING(70)},
		nombre_original: {type: dt.STRING(70)},
		idioma_original_id: {type: dt.STRING(2)},
		duracion: {type: dt.INTEGER},
		paises_id: {type: dt.STRING(14)},
		ano_estreno: {type: dt.INTEGER},
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
		tipo_actuacion_id: {type: dt.INTEGER},
		publico_sugerido_id: {type: dt.INTEGER},

		personaje_id: {type: dt.INTEGER},
		hecho_id: {type: dt.INTEGER},
		valor_id: {type: dt.INTEGER},

		fe_valores: {type: dt.INTEGER},
		entretiene: {type: dt.INTEGER},
		calidad_tecnica: {type: dt.INTEGER},
		calificacion: {type: dt.INTEGER},

		color: {type: dt.BOOLEAN},
		castellano: {type: dt.BOOLEAN},

		creado_por_id: {type: dt.INTEGER},
		creado_en: {type: dt.DATE},
		alta_analizada_por_id: {type: dt.INTEGER},
		alta_analizada_en: {type: dt.DATE},
		alta_terminada_en: {type: dt.DATE},
		lead_time_creacion: {type: dt.DECIMAL},

		editado_por_id: {type: dt.INTEGER},
		editado_en: {type: dt.DATE},
		edic_analizada_por_id: {type: dt.INTEGER},
		edic_analizada_en: {type: dt.DATE},
		lead_time_edicion: {type: dt.DECIMAL},

		status_registro_id: {type: dt.INTEGER},
		motivo_id: {type: dt.INTEGER},
		sugerido_por_id: {type: dt.INTEGER},
		sugerido_en: {type: dt.DATE},

		capturado_por_id: {type: dt.INTEGER},
		capturado_en: {type: dt.DATE},
		captura_activa: {type: dt.BOOLEAN},

		links_gratis_en_bd_id: {type: dt.INTEGER},
		links_gratis_en_web_id: {type: dt.INTEGER},
	};
	const config = {
		tableName: "prod_1peliculas",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.idiomas, {as: "idioma_original", foreignKey: "idioma_original_id"});
		entidad.belongsTo(n.tipos_de_actuacion, {as: "tipo_actuacion", foreignKey: "tipo_actuacion_id"});
		entidad.belongsTo(n.publicos_sugeridos, {as: "publico_sugerido", foreignKey: "publico_sugerido_id"});

		entidad.belongsTo(n.personajes, {as: "personaje", foreignKey: "personaje_id"});
		entidad.belongsTo(n.hechos, {as: "hecho", foreignKey: "hecho_id"});
		entidad.belongsTo(n.valores, {as: "valor", foreignKey: "valor_id"});

		entidad.belongsTo(n.usuarios, {as: "creado_por", foreignKey: "creado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "alta_analizada_por", foreignKey: "alta_analizada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "editado_por", foreignKey: "editado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "edic_analizada_por", foreignKey: "edic_analizada_por_id"});

		entidad.belongsTo(n.status_registro, {as: "status_registro", foreignKey: "status_registro_id"});
		entidad.belongsTo(n.altas_motivos_rech, {as: "motivo", foreignKey: "motivo_id"});
		entidad.belongsTo(n.usuarios, {as: "sugerido_por", foreignKey: "sugerido_por_id"});
		entidad.belongsTo(n.usuarios, {as: "capturado_por", foreignKey: "capturado_por_id"});

		entidad.belongsTo(n.si_no_parcial, {as: "links_gratis_en_BD", foreignKey: "links_gratis_en_bd_id"});
		entidad.belongsTo(n.si_no_parcial, {as: "links_gratis_en_web", foreignKey: "links_gratis_en_web_id"});

		entidad.hasMany(n.historial_cambios_de_status, {as: "historial", foreignKey: "pelicula_id"});
		entidad.hasMany(n.prods_edicion, {as: "ediciones", foreignKey: "pelicula_id"});
		entidad.hasMany(n.links, {as: "links", foreignKey: "pelicula_id"});
		entidad.hasMany(n.links_edicion, {as: "links_edic", foreignKey: "pelicula_id"});
	};
	return entidad;
};
