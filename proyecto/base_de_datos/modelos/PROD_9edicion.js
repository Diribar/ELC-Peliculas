module.exports = (sequelize, dt) => {
	const alias = "prodsEdicion";
	const columns = {
		pelicula_id: {type: dt.INTEGER},
		coleccion_id: {type: dt.INTEGER},
		capitulo_id: {type: dt.INTEGER},
		nombreOriginal: {type: dt.STRING(70)},
		nombreCastellano: {type: dt.STRING(70)},
		duracion: {type: dt.INTEGER},
		anoEstreno: {type: dt.INTEGER},
		anoFin: {type: dt.INTEGER},
		paises_id: {type: dt.STRING(14)},
		idiomaOriginal_id: {type: dt.STRING(2)},
		direccion: {type: dt.STRING(100)},
		guion: {type: dt.STRING(100)},
		musica: {type: dt.STRING(100)},
		actores: {type: dt.STRING(500)},
		produccion: {type: dt.STRING(100)},
		sinopsis: {type: dt.STRING(900)},
		avatar: {type: dt.STRING(18)},
		avatarUrl: {type: dt.STRING(100)},

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
		epocaOcurrencia_id: {type: dt.INTEGER},

		editadoPor_id: {type: dt.INTEGER},
		editadoEn: {type: dt.DATE},
	};
	const config = {
		tableName: "prod_9edicion",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.peliculas, {as: "pelicula", foreignKey: "pelicula_id"});
		entidad.belongsTo(n.colecciones, {as: "coleccion", foreignKey: "coleccion_id"});
		entidad.belongsTo(n.capitulos, {as: "capitulo", foreignKey: "capitulo_id"});

		entidad.belongsTo(n.idiomas, {as: "idioma_original", foreignKey: "idiomaOriginal_id"});
		entidad.belongsTo(n.tiposActuacion, {as: "tipoActuacion", foreignKey: "tipoActuacion_id"});
		entidad.belongsTo(n.publicos, {as: "publico", foreignKey: "publico_id"});

		entidad.belongsTo(n.personajes, {as: "personaje", foreignKey: "personaje_id"});
		entidad.belongsTo(n.hechos, {as: "hecho", foreignKey: "hecho_id"});
		entidad.belongsTo(n.temas, {as: "tema", foreignKey: "tema_id"});
		entidad.belongsTo(n.eventos, {as: "evento", foreignKey: "evento_id"});
		entidad.belongsTo(n.epocasDelAno, {as: "epocaDelAno", foreignKey: "epocaDelAno_id"});
		entidad.belongsTo(n.epocasOcurrencia, {as: "epocaOcurrencia", foreignKey: "epocaOcurrencia_id"});

		entidad.belongsTo(n.usuarios, {as: "editado_por", foreignKey: "editadoPor_id"});
	};
	return entidad;
};
