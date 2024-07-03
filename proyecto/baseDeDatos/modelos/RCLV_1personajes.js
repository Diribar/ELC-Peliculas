module.exports = (sequelize, dt) => {
	const alias = "personajes";
	const columns = {
		// Común con todos los RCLVs
		nombre: {type: dt.STRING(35)},
		genero_id: {type: dt.STRING(3)},
		prodsAprob: {type: dt.INTEGER},
		fechaDelAno_id: {type: dt.INTEGER},
		fechaMovil: {type: dt.BOOLEAN},
		anoFM: {type: dt.INTEGER},
		comentarioMovil: {type: dt.STRING(70)},
		prioridad_id: {type: dt.INTEGER},
		avatar: {type: dt.STRING(15)},

		// Común con hechos
		nombreAltern: {type: dt.STRING(35)},
		epocaOcurrencia_id: {type: dt.STRING(3)},
		leyNombre: {type: dt.STRING(70)},

		// Específicos
		canon_id: {type: dt.STRING(3)},
		anoNacim: {type: dt.INTEGER},
		categoria_id: {type: dt.STRING(3)},
		rolIglesia_id: {type: dt.STRING(3)},
		apMar_id: {type: dt.INTEGER},

		// Fechas y Usuarios
		creadoPor_id: {type: dt.INTEGER},
		creadoEn: {type: dt.DATE},
		altaRevisadaPor_id: {type: dt.INTEGER},
		altaRevisadaEn: {type: dt.DATE},
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

		statusRegistro_id: {type: dt.INTEGER},
	};
	const config = {
		tableName: "rclv_1personajes",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.generos, {as: "genero", foreignKey: "genero_id"});
		entidad.belongsTo(n.fechasDelAno, {as: "fechaDelAno", foreignKey: "fechaDelAno_id"});
		entidad.belongsTo(n.epocasOcurrencia, {as: "epocaOcurrencia", foreignKey: "epocaOcurrencia_id"});

		entidad.belongsTo(n.categorias, {as: "categoria", foreignKey: "categoria_id"});
		entidad.belongsTo(n.rolesIglesia, {as: "rolIglesia", foreignKey: "rolIglesia_id"});
		entidad.belongsTo(n.canons, {as: "canon", foreignKey: "canon_id"});
		entidad.belongsTo(n.hechos, {as: "apMar", foreignKey: "apMar_id"});

		entidad.belongsTo(n.usuarios, {as: "creadoPor", foreignKey: "creadoPor_id"});
		entidad.belongsTo(n.usuarios, {as: "altaRevisadaPor", foreignKey: "altaRevisadaPor_id"});
		entidad.belongsTo(n.usuarios, {as: "statusSugeridoPor", foreignKey: "statusSugeridoPor_id"});
		entidad.belongsTo(n.usuarios, {as: "editadoPor", foreignKey: "editadoPor_id"});
		entidad.belongsTo(n.usuarios, {as: "edicRevisadaPor", foreignKey: "edicRevisadaPor_id"});

		entidad.belongsTo(n.statusRegistros, {as: "statusRegistro", foreignKey: "statusRegistro_id"});
		entidad.belongsTo(n.usuarios, {as: "capturadoPor", foreignKey: "capturadoPor_id"});

		entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "personaje_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones", foreignKey: "personaje_id"});
		entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "personaje_id"});
		entidad.hasMany(n.prodsEdicion, {as: "prodsEdiciones", foreignKey: "personaje_id"});

		entidad.hasMany(n.rclvsEdicion, {as: "ediciones", foreignKey: "personaje_id"});
	};
	return entidad;
};
