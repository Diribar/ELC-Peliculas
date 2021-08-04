module.exports = (sequelize, dt) => {
	const alias = "peliculas";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		tmdb_id: { type: dt.STRING(10) },
		fa_id: { type: dt.STRING(10) },
		imdb_id: { type: dt.STRING(10) },
		nombre_original: { type: dt.STRING(100) },
		nombre_castellano: { type: dt.STRING(100) },
		coleccion_pelicula_id: { type: dt.INTEGER },
		duracion: { type: dt.INTEGER },
		ano_estreno: { type: dt.INTEGER },
		pais_id: { type: dt.STRING(20) },
		director: { type: dt.STRING(50) },
		guion: { type: dt.STRING(50) },
		musica: { type: dt.STRING(50) },
		actores: { type: dt.STRING(500) },
		productor: { type: dt.STRING(50) },
		avatar: { type: dt.STRING(100) },
		idioma_castellano: { type: dt.BOOLEAN },
		color: { type: dt.BOOLEAN },
		publico_recomendado_id: { type: dt.INTEGER },
		categoria_id: { type: dt.STRING(3) },
		subcategoria_id: { type: dt.INTEGER },
		sinopsis: { type: dt.STRING(800) },
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
		borrada_motivo: { type: dt.STRING(500) },
	};
	const config = {
		tableName: "peliculas",
		timestamps: false
	};
	const entidad = sequelize.define(alias,columns,config);
	entidad.associate = n => {
		entidad.belongsTo(n.paises, {as: "pais", foreignKey: "pais_id"});
		entidad.belongsTo(n.categorias, {as: "categoria", foreignKey: "categoria_id"});
		entidad.belongsTo(n.subcategorias, {as: "subcategoria", foreignKey: "subcategoria_id"});
		entidad.belongsTo(n.colecciones_peliculas, {as: "coleccion_pelicula", foreignKey: "coleccion_pelicula_id"});
		entidad.belongsTo(n.publicos_recomendados, {as: "publico_recomendado", foreignKey: "publico_recomendado_id"});
		entidad.belongsTo(n.personajes_historicos, {as: "personaje_historico", foreignKey: "personaje_historico_id"});
		entidad.belongsTo(n.hechos_historicos, {as: "hecho_historico", foreignKey: "hecho_historico_id"});
		entidad.belongsTo(n.eventos, {as: "sugerida_para_evento", foreignKey: "sugerida_para_evento_id"});
		entidad.belongsTo(n.usuarios, {as: "creada_por", foreignKey: "creada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "analizada_por", foreignKey: "analizada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "editada_por", foreignKey: "editada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "revisada_por", foreignKey: "revisada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "borrada_por", foreignKey: "borrada_por_id"});

		//entidad.belongsToMany(n.actor, {as: "actores", through: "actor_pelicula", foreignKey: "pelicula_id", otherKey: "actor_id", timestamps: false})
		//entidad.belongsToMany(n.director, {as: "directores", through: "director_pelicula", foreignKey: "pelicula_id", otherKey: "director_id", timestamps: false})
		//entidad.belongsToMany(n.guionista, {as: "guionistas", through: "guionista_pelicula", foreignKey: "pelicula_id", otherKey: "guionista_id", timestamps: false})
		//entidad.belongsToMany(n.musico, {as: "musicos", through: "musico_pelicula", foreignKey: "pelicula_id", otherKey: "musico_id", timestamps: false})
		//entidad.belongsToMany(n.productor, {as: "productores", through: "productor_pelicula", foreignKey: "pelicula_id", otherKey: "productor_id", timestamps: false})

		entidad.hasMany(n.us_pel_calificaciones, {as: "us_pel_calificaciones",foreignKey: "pelicula_id"});

	};
	return entidad;
}; 