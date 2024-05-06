module.exports = (sequelize, dt) => {
	const alias = "eventos";
	const columns = {
		// Común con todos los RCLVs
		nombre: {type: dt.STRING(35)},
		genero_id: {type: dt.STRING(1)},
		prodsAprob: {type: dt.INTEGER},
		fechaDelAno_id: {type: dt.INTEGER},
		fechaMovil: {type: dt.BOOLEAN},
		anoFM: {type: dt.INTEGER},
		comentarioMovil: {type: dt.STRING(70)},
		prioridad_id: {type: dt.INTEGER},
		avatar: {type: dt.STRING(15)},

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
		tableName: "rclv_4eventos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.fechasDelAno, {as: "fechaDelAno", foreignKey: "fechaDelAno_id"});

		entidad.belongsTo(n.usuarios, {as: "creadoPor", foreignKey: "creadoPor_id"});
		entidad.belongsTo(n.usuarios, {as: "altaRevisadaPor", foreignKey: "altaRevisadaPor_id"});
		entidad.belongsTo(n.usuarios, {as: "statusSugeridoPor", foreignKey: "statusSugeridoPor_id"});
		entidad.belongsTo(n.usuarios, {as: "editadoPor", foreignKey: "editadoPor_id"});
		entidad.belongsTo(n.usuarios, {as: "edicRevisadaPor", foreignKey: "edicRevisadaPor_id"});

		entidad.belongsTo(n.statusRegistros, {as: "statusRegistro", foreignKey: "statusRegistro_id"});
		entidad.belongsTo(n.motivosStatus, {as: "motivo", foreignKey: "motivo_id"});
		entidad.belongsTo(n.usuarios, {as: "capturadoPor", foreignKey: "capturadoPor_id"});

		entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "evento_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones", foreignKey: "evento_id"});
		entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "evento_id"});
		entidad.hasMany(n.prodsEdicion, {as: "prodsEdiciones", foreignKey: "evento_id"});

		entidad.hasMany(n.rclvsEdicion, {as: "ediciones", foreignKey: "evento_id"});
	};
	return entidad;
};
