module.exports = (sequelize, dt) => {
	const alias = "colecciones";
	const columns = {
		TMDB_id: {type: dt.STRING(10)},
		FA_id: {type: dt.STRING(10)},
		TMDB_entidad: {type: dt.STRING(10)},
		fuente: {type: dt.STRING(5)},
		nombre_castellano: {type: dt.STRING(100)},
		nombre_original: {type: dt.STRING(100)},
		paises_id: {type: dt.STRING(18)},
		idioma_original_id: {type: dt.STRING(2)},
		ano_estreno: {type: dt.INTEGER},
		ano_fin: {type: dt.INTEGER},
		cant_temporadas: {type: dt.INTEGER},
		cant_capitulos: {type: dt.INTEGER},
		direccion: {type: dt.STRING(100)},
		guion: {type: dt.STRING(100)},
		musica: {type: dt.STRING(100)},
		actuacion: {type: dt.STRING(500)},
		produccion: {type: dt.STRING(50)},
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
		dia_del_ano_id: {type: dt.INTEGER},

		fe_valores: {type: dt.INTEGER},
		entretiene: {type: dt.INTEGER},
		calidad_tecnica: {type: dt.INTEGER},
		calificacion: {type: dt.INTEGER},

		creado_por_id: {type: dt.INTEGER},
		creado_en: {type: dt.DATE},
		alta_analizada_por_id: {type: dt.INTEGER},
		alta_analizada_en: {type: dt.DATE},
		alta_terminada_en: {type: dt.DATE},
		lead_time_creacion: {type: dt.DECIMAL(4, 2)},
		
		status_registro_id: {type: dt.INTEGER},

		editado_en: {type: dt.DATE},
		edic_analizada_en: {type: dt.DATE},
		lead_time_edicion: {type: dt.DECIMAL(4, 2)},

		capturado_por_id: {type: dt.INTEGER},
		capturado_en: {type: dt.DATE},
		captura_activa: {type: dt.BOOLEAN},

		links_gratuitos_cargados_id: {type: dt.INTEGER},
		links_gratuitos_en_la_web_id: {type: dt.INTEGER},
	};
	const config = {
		tableName: "prod_2colecciones",
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

		entidad.belongsTo(n.RCLV_personajes, {as: "personaje", foreignKey: "personaje_id"});
		entidad.belongsTo(n.RCLV_hechos, {as: "hecho", foreignKey: "hecho_id"});
		entidad.belongsTo(n.RCLV_valores, {as: "valor", foreignKey: "valor_id"});
		entidad.belongsTo(n.dias_del_ano, {as: "dia_del_ano", foreignKey: "dia_del_ano_id"});

		entidad.belongsTo(n.usuarios, {as: "creado_por", foreignKey: "creado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "alta_analizada_por", foreignKey: "alta_analizada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "capturado_por", foreignKey: "capturado_por_id"});
		entidad.belongsTo(n.status_registro, {as: "status_registro", foreignKey: "status_registro_id"});

		entidad.belongsTo(n.si_no_parcial, {as: "links_gratuitos_cargados", foreignKey: "links_gratuitos_cargados_id"});
		entidad.belongsTo(n.si_no_parcial, {as: "links_gratuitos_en_la_web", foreignKey: "links_gratuitos_en_la_web_id"});

		entidad.hasMany(n.capitulos, {as: "capitulos",foreignKey: "coleccion_id"});
		entidad.hasMany(n.prods_edicion, {as: "ediciones", foreignKey: "coleccion_id"});
		entidad.hasMany(n.links_originales, {as: "links", foreignKey: "coleccion_id"});
		entidad.hasMany(n.links_edicion, {as: "links_edic", foreignKey: "coleccion_id"});
	};
	return entidad;
};
