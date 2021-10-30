module.exports = (sequelize, dt) => {
	const alias = "colecciones";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		colec_tmdb_id: { type: dt.STRING(10) },
		colec_fa_id: { type: dt.STRING(10) },
		colec_tmdb_rubro: { type: dt.STRING(10) },
		fuente: { type: dt.STRING(5) },
		nombre_original: { type: dt.STRING(100) },
		nombre_castellano: { type: dt.STRING(100) },
		ano_estreno: { type: dt.INTEGER },
		ano_fin: { type: dt.INTEGER },
		pais_id: { type: dt.STRING(20) },
		director: { type: dt.STRING(50) },
		guion: { type: dt.STRING(50) },
		musica: { type: dt.STRING(50) },
		actores: { type: dt.STRING(500) },
		productor: { type: dt.STRING(50) },
		sinopsis: { type: dt.STRING(800) },
		avatar: { type: dt.STRING(100) },
		categoria_id: { type: dt.STRING(3) },
		subcategoria_id: { type: dt.INTEGER },
		publico_sugerido_id: { type: dt.INTEGER },
		personaje_historico_id: { type: dt.INTEGER },
		hecho_historico_id: { type: dt.INTEGER },
		link_trailer: { type: dt.STRING(800) },
		link_pelicula: { type: dt.STRING(800) },

		calificacion: { type: dt.INTEGER },
		creada_por_id: { type: dt.INTEGER },
		creada_en: { type: dt.DATE },
		analizada_por_id: { type: dt.INTEGER },
		analizada_en: { type: dt.DATE },
		aprobada: { type: dt.BOOLEAN },
		fechaFIFO: { type: dt.DATE },
		editada_por_id: { type: dt.INTEGER },
		editada_en: { type: dt.DATE },
		revisada_por_id: { type: dt.INTEGER },
		revisada_en: { type: dt.DATE },
		borrada: { type: dt.BOOLEAN },
		borrada_por_id: { type: dt.INTEGER },
		borrada_en: { type: dt.DATE },
		borrada_motivo_id: { type: dt.INTEGER },
		borrada_motivo_comentario: { type: dt.STRING(500) },
	};
	const config = {
		tableName: "colecciones",
		timestamps: false,
	};
	const entidad = sequelize.define(alias,columns,config);
	entidad.associate = n => {
		entidad.belongsTo(n.categorias, {as: "categoria", foreignKey: "categoria_id"});
		entidad.belongsTo(n.subcategorias, {as: "subcategoria", foreignKey: "subcategoria_id"});
		entidad.belongsTo(n.publicos_sugeridos, {as: "publico_sugerido", foreignKey: "publico_sugerido_id"});
		entidad.belongsTo(n.historicos_personajes, {as: "personaje_historico", foreignKey: "personaje_historico_id"});
		entidad.belongsTo(n.historicos_hechos, {as: "hecho_historico", foreignKey: "hecho_historico_id"});
		entidad.belongsTo(n.usuarios, {as: "creada_por", foreignKey: "creada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "analizada_por", foreignKey: "analizada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "editada_por", foreignKey: "editada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "revisada_por", foreignKey: "revisada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "borrada_por", foreignKey: "borrada_por_id"});
		entidad.belongsTo(n.motivos_para_borrar, {as: "borrada_motivo", foreignKey: "borrada_motivo_id"});
		entidad.hasMany(n.colecciones_partes, {as: "coleccion_partes",foreignKey: "colec_id"});
	};
	return entidad;
};
