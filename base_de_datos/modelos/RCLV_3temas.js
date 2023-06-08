module.exports = (sequelize, dt) => {
	const alias = "temas";
	const columns = {
		// Común con todos los RCLVs
		nombre: {type: dt.STRING(35)},
		prodsAprob: {type: dt.INTEGER},
		diaDelAno_id: {type: dt.INTEGER},
		fechaMovil: {type: dt.BOOLEAN},
		comentarioMovil: {type: dt.STRING(70)},
		prioridad_id: {type: dt.INTEGER},
		avatar: {type: dt.STRING(15)},

		// Fechas y Usuarios
		creadoPor_id: {type: dt.INTEGER},
		creadoEn: {type: dt.DATE},
		altaRevisadaPor_id: {type: dt.INTEGER},
		altaRevisadaEn: {type: dt.DATE},
		leadTimeCreacion: {type: dt.DECIMAL},

		editadoPor_id: {type: dt.INTEGER},
		editadoEn: {type: dt.DATE},
		edicRevisadaPor_id: {type: dt.INTEGER},
		edicRevisadaEn: {type: dt.DATE},
		leadTimeEdicion: {type: dt.DECIMAL},

		sugeridoPor_id: {type: dt.INTEGER},
		sugeridoEn: {type: dt.DATE},
		capturadoPor_id: {type: dt.INTEGER},
		capturadoEn: {type: dt.DATE},
		capturaActiva: {type: dt.BOOLEAN},

		statusRegistro_id: {type: dt.INTEGER},
		motivo_id: {type: dt.INTEGER},
	};
	const config = {
		tableName: "rclv_3temas",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.diasDelAno, {as: "diaDelAno", foreignKey: "diaDelAno_id"});

		entidad.belongsTo(n.usuarios, {as: "creado_por", foreignKey: "creadoPor_id"});
		entidad.belongsTo(n.usuarios, {as: "alta_revisada_por", foreignKey: "altaRevisadaPor_id"});
		entidad.belongsTo(n.usuarios, {as: "editado_por", foreignKey: "editadoPor_id"});
		entidad.belongsTo(n.usuarios, {as: "edic_revisada_por", foreignKey: "edicRevisadaPor_id"});

		entidad.belongsTo(n.status_registros, {as: "statusRegistro", foreignKey: "statusRegistro_id"});
		entidad.belongsTo(n.motivosStatus, {as: "motivo", foreignKey: "motivo_id"});
		entidad.belongsTo(n.usuarios, {as: "sugerido_por", foreignKey: "sugeridoPor_id"});
		entidad.belongsTo(n.usuarios, {as: "capturado_por", foreignKey: "capturadoPor_id"});

		entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "tema_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones", foreignKey: "tema_id"});
		entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "tema_id"});
		entidad.hasMany(n.prods_edicion, {as: "prods_ediciones", foreignKey: "tema_id"});

		entidad.hasMany(n.rclvs_edicion, {as: "ediciones", foreignKey: "tema_id"});
	};
	return entidad;
};
