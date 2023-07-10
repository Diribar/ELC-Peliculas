module.exports = (sequelize, dt) => {
	const alias = "personajes";
	const columns = {
		// Común con todos los RCLVs
		nombre: {type: dt.STRING(35)},
		prodsAprob: {type: dt.INTEGER},
		diaDelAno_id: {type: dt.INTEGER},
		fechaMovil: {type: dt.BOOLEAN},
		comentarioMovil: {type: dt.STRING(70)},
		prioridad_id: {type: dt.INTEGER},
		avatar: {type: dt.STRING(15)},

		// Común con hechos
		ano: {type: dt.INTEGER},
		epocaOcurrencia_id: {type: dt.STRING(3)},

		// Específicos
		apodo: {type: dt.STRING(35)},
		sexo_id: {type: dt.STRING(1)},
		categoria_id: {type: dt.STRING(3)},
		rolIglesia_id: {type: dt.STRING(3)},
		canon_id: {type: dt.STRING(3)},
		apMar_id: {type: dt.INTEGER},

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

		motivo_id: {type: dt.INTEGER},
		statusRegistro_id: {type: dt.INTEGER},
	};
	const config = {
		tableName: "rclv_1personajes",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.sexos, {as: "sexo", foreignKey: "sexo_id"});
		entidad.belongsTo(n.diasDelAno, {as: "diaDelAno", foreignKey: "diaDelAno_id"});
		entidad.belongsTo(n.epocas, {as: "epoca", foreignKey: "epocaOcurrencia_id"});

		entidad.belongsTo(n.categorias, {as: "categoria", foreignKey: "categoria_id"});
		entidad.belongsTo(n.roles_iglesia, {as: "rolIglesia", foreignKey: "rolIglesia_id"});
		entidad.belongsTo(n.canons, {as: "canon", foreignKey: "canon_id"});
		entidad.belongsTo(n.hechos, {as: "ap_mar", foreignKey: "apMar_id"});

		entidad.belongsTo(n.usuarios, {as: "creado_por", foreignKey: "creadoPor_id"});
		entidad.belongsTo(n.usuarios, {as: "alta_revisada_por", foreignKey: "altaRevisadaPor_id"});
		entidad.belongsTo(n.usuarios, {as: "editado_por", foreignKey: "editadoPor_id"});
		entidad.belongsTo(n.usuarios, {as: "edic_revisada_por", foreignKey: "edicRevisadaPor_id"});

		entidad.belongsTo(n.statusRegistros, {as: "statusRegistro", foreignKey: "statusRegistro_id"});
		entidad.belongsTo(n.motivosStatus, {as: "motivo", foreignKey: "motivo_id"});
		entidad.belongsTo(n.usuarios, {as: "sugerido_por", foreignKey: "statusSugeridoPor_id"});
		entidad.belongsTo(n.usuarios, {as: "capturado_por", foreignKey: "capturadoPor_id"});

		entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "personaje_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones", foreignKey: "personaje_id"});
		entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "personaje_id"});
		entidad.hasMany(n.prods_edicion, {as: "prods_ediciones", foreignKey: "personaje_id"});

		entidad.hasMany(n.rclvs_edicion, {as: "ediciones", foreignKey: "personaje_id"});
	};
	return entidad;
};
