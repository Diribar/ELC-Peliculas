module.exports = (sequelize, dt) => {
	const alias = "epocasDelAno";
	const columns = {
		// Común con todos los RCLVs
		nombre: {type: dt.STRING(35)},
		prodsAprob: {type: dt.INTEGER},
		fechaDelAno_id: {type: dt.INTEGER},
		fechaMovil: {type: dt.BOOLEAN},
		anoFM: {type: dt.INTEGER},
		comentarioMovil: {type: dt.STRING(70)},
		prioridad_id: {type: dt.INTEGER},
		avatar: {type: dt.STRING(15)},

		// Específicos
		diasDeDuracion: {type: dt.INTEGER},
		comentarioDuracion: {type: dt.STRING(70)},
		carpetaAvatars: {type: dt.STRING(20)},
		solapamiento: {type: dt.BOOLEAN},

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

		motivo_id: {type: dt.INTEGER},
		statusRegistro_id: {type: dt.INTEGER},
	};
	const config = {
		tableName: "rclv_5epocas_del_ano",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.fechasDelAno, {as: "fechaDelAno", foreignKey: "fechaDelAno_id"});

		entidad.belongsTo(n.usuarios, {as: "creadoPor", foreignKey: "creadoPor_id"});
		entidad.belongsTo(n.usuarios, {as: "altaRevisadaPor", foreignKey: "altaRevisadaPor_id"});
		entidad.belongsTo(n.usuarios, {as: "editado_por", foreignKey: "editadoPor_id"});
		entidad.belongsTo(n.usuarios, {as: "edicRevisadaPor", foreignKey: "edicRevisadaPor_id"});

		entidad.belongsTo(n.statusRegistros, {as: "statusRegistro", foreignKey: "statusRegistro_id"});
		entidad.belongsTo(n.motivosStatus, {as: "motivo", foreignKey: "motivo_id"});
		entidad.belongsTo(n.usuarios, {as: "sugerido_por", foreignKey: "statusSugeridoPor_id"});
		entidad.belongsTo(n.usuarios, {as: "capturado_por", foreignKey: "capturadoPor_id"});

		entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "epocaDelAno_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones", foreignKey: "epocaDelAno_id"});
		entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "epocaDelAno_id"});
		entidad.hasMany(n.prodsEdicion, {as: "prodsEdiciones", foreignKey: "epocaDelAno_id"});

		entidad.hasMany(n.rclvsEdicion, {as: "ediciones", foreignKey: "epocaDelAno_id"});

		entidad.hasMany(n.fechasDelAno, {as: "fechasDelAno", foreignKey: "epocaDelAno_id"});
	};
	return entidad;
};
