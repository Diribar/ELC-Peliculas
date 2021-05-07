module.exports = (sequelize, dt) => {
    const alias = "pelicula";
    const columns = {
		id: {type: dt.INTEGER, primaryKey: true},
		tmdb_id: {type: dt.STRING(20)},
		fa_id: {type: dt.STRING(20)},
		imdb_id: {type: dt.STRING(20)},
		titulo_original: {type: dt.STRING(100)},
		titulo_castellano: {type: dt.STRING(100)},
		coleccion_id: {type: dt.INTEGER},
		duracion: {type: dt.INTEGER},
		ano_estreno: {type: dt.INTEGER},
		epoca_estreno_id: {type: dt.INTEGER},
		pais_id: {type: dt.STRING(2)},
		avatar: {type: dt.STRING(100)},
		idioma_castellano: {type: dt.BOOLEAN},
		color: {type: dt.BOOLEAN},
		publico_recomendado_id: {type: dt.INTEGER},
		categoria_id: {type: dt.STRING(3)},
		subcategoria_id: {type: dt.INTEGER},
		precuela_de: {type: dt.STRING(100)},
		secuela_de: {type: dt.STRING(100)},
		sinopsis: {type: dt.STRING(500)},
		creada_por: {type: dt.INTEGER},
		creada_en: {type: dt.DATE},
		analizada_por: {type: dt.INTEGER},
		analizada_en: {type: dt.DATE},
		aprobada: {type: dt.BOOLEAN},
		fechaFIFO: {type: dt.DATE},
		editada_por: {type: dt.INTEGER},
		editada_en: {type: dt.DATE},
		revisada_por: {type: dt.INTEGER},
		revisada_en: {type: dt.DATE},
		borrado: {type: dt.BOOLEAN},
		borrado_por: {type: dt.INTEGER},
		borrado_en: {type: dt.DATE},
		borrado_motivo: {type: dt.STRING(500)},
	};

	const config = {
        tableName: "peliculas",
		timestamps: false
	};

    const entidad = sequelize.define(alias,columns,config);

    entidad.associate = n => {
        entidad.belongsTo(n.coleccion__pelicula, {as: "coleccion__pelicula", foreignKey: "coleccion_id"});
    };

    return entidad;
}; 