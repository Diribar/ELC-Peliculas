module.exports = (sequelize, dt) => {
	const alias = "colecciones";
	const columns = {
		TMDB_id: {type: dt.STRING(10)},
		FA_id: {type: dt.STRING(10)},
		TMDB_entidad: {type: dt.STRING(10)},
		fuente: {type: dt.STRING(5)},
		nombreCastellano: {type: dt.STRING(70)},
		nombreOriginal: {type: dt.STRING(70)},
		paises_id: {type: dt.STRING(14)},
		idiomaOriginal_id: {type: dt.STRING(2)},
		anoEstreno: {type: dt.INTEGER},
		anoFin: {type: dt.INTEGER},
		cantTemps: {type: dt.INTEGER},
		direccion: {type: dt.STRING(100)},
		guion: {type: dt.STRING(100)},
		musica: {type: dt.STRING(100)},
		actores: {type: dt.STRING(500)},
		produccion: {type: dt.STRING(50)},
		sinopsis: {type: dt.STRING(1004)},
		avatar: {type: dt.STRING(100)},

		cfc: {type: dt.BOOLEAN},
		bhr: {type: dt.BOOLEAN},
		musical: {type: dt.BOOLEAN},
		color: {type: dt.BOOLEAN},
		tipoActuacion_id: {type: dt.INTEGER},
		publico_id: {type: dt.INTEGER},

		personaje_id: {type: dt.INTEGER},
		hecho_id: {type: dt.INTEGER},
		tema_id: {type: dt.INTEGER},
		evento_id: {type: dt.INTEGER},
		epocaDelAno_id: {type: dt.INTEGER},

		epocaOcurrencia_id: {type: dt.STRING(3)},
		epocaEstreno_id: {type: dt.INTEGER},
		linksTrailer: {type: dt.INTEGER},

		linksGral: {type: dt.INTEGER},
		linksGratis: {type: dt.INTEGER},
		linksCast: {type: dt.INTEGER},
		linksSubt: {type: dt.INTEGER},
		HD_Gral: {type: dt.INTEGER},
		HD_Gratis: {type: dt.INTEGER},
		HD_Cast: {type: dt.INTEGER},
		HD_Subt: {type: dt.INTEGER},

		feValores: {type: dt.INTEGER},
		entretiene: {type: dt.INTEGER},
		calidadTecnica: {type: dt.INTEGER},
		calificacion: {type: dt.INTEGER},
		azar: {type: dt.INTEGER},

		creadoPor_id: {type: dt.INTEGER},
		creadoEn: {type: dt.DATE},
		altaRevisadaPor_id: {type: dt.INTEGER},
		altaRevisadaEn: {type: dt.DATE},
		altaTermEn: {type: dt.DATE},
		leadTimeCreacion: {type: dt.DECIMAL},

		statusSugeridoPor_id: {type: dt.INTEGER},
		statusSugeridoEn: {type: dt.DATE},

		editadoPor_id: {type: dt.INTEGER},
		editadoEn: {type: dt.DATE},
		edicRevisadaPor_id: {type: dt.INTEGER},
		edicRevisadaEn: {type: dt.DATE},
		leadTimeEdicion: {type: dt.DECIMAL},

		capturadoPor_id: {type: dt.INTEGER},
		capturadoEn: {type: dt.DATE},
		capturaActiva: {type: dt.BOOLEAN},

		motivo_id: {type: dt.INTEGER},
		statusRegistro_id: {type: dt.INTEGER},
	};
	const config = {
		tableName: "prod_2colecciones",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.idiomas, {as: "idioma_original", foreignKey: "idiomaOriginal_id"});
		entidad.belongsTo(n.tiposActuacion, {as: "tipoActuacion", foreignKey: "tipoActuacion_id"});
		entidad.belongsTo(n.publicos, {as: "publico", foreignKey: "publico_id"});

		entidad.belongsTo(n.personajes, {as: "personaje", foreignKey: "personaje_id"});
		entidad.belongsTo(n.hechos, {as: "hecho", foreignKey: "hecho_id"});
		entidad.belongsTo(n.temas, {as: "tema", foreignKey: "tema_id"});
		entidad.belongsTo(n.eventos, {as: "evento", foreignKey: "evento_id"});
		entidad.belongsTo(n.epocasDelAno, {as: "epocaDelAno", foreignKey: "epocaDelAno_id"});
		entidad.belongsTo(n.epocasOcurrencia, {as: "epocaOcurrencia", foreignKey: "epocaOcurrencia_id"});
		entidad.belongsTo(n.epocasEstreno, {as: "epocaEstreno", foreignKey: "epocaEstreno_id"});

		entidad.belongsTo(n.usuarios, {as: "creadoPor", foreignKey: "creadoPor_id"});
		entidad.belongsTo(n.usuarios, {as: "altaRevisadaPor", foreignKey: "altaRevisadaPor_id"});
		entidad.belongsTo(n.usuarios, {as: "statusSugeridoPor", foreignKey: "statusSugeridoPor_id"});
		entidad.belongsTo(n.usuarios, {as: "editadoPor", foreignKey: "editadoPor_id"});
		entidad.belongsTo(n.usuarios, {as: "edicRevisadaPor", foreignKey: "edicRevisadaPor_id"});

		entidad.belongsTo(n.statusRegistros, {as: "statusRegistro", foreignKey: "statusRegistro_id"});
		entidad.belongsTo(n.motivosStatus, {as: "motivo", foreignKey: "motivo_id"});
		entidad.belongsTo(n.usuarios, {as: "capturadoPor", foreignKey: "capturadoPor_id"});

		entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "coleccion_id"});
		entidad.hasMany(n.prodsEdicion, {as: "ediciones", foreignKey: "coleccion_id"});
		entidad.hasMany(n.links, {as: "links", foreignKey: "coleccion_id"});
		entidad.hasMany(n.linksEdicion, {as: "links_edic", foreignKey: "coleccion_id"});
	};
	return entidad;
};
