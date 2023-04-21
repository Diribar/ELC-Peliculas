module.exports = (sequelize, dt) => {
	const alias = "epocas_del_ano";
	const columns = {
		// Común con todos los RCLVs
		nombre: {type: dt.STRING(30)},
		prods_aprob: {type: dt.INTEGER},
		dia_del_ano_id: {type: dt.INTEGER},
		fecha_movil: {type: dt.BOOLEAN},
		prioridad: {type: dt.INTEGER},
		avatar: {type: dt.STRING(15)},

		// Específicos
		dias_de_rango: {type: dt.INTEGER},
		carpeta_avatars: {type: dt.STRING(20)},

		// Común con todos los RCLVs
		creado_por_id: {type: dt.INTEGER},
		creado_en: {type: dt.DATE},
		alta_revisada_por_id: {type: dt.INTEGER},
		alta_revisada_en: {type: dt.DATE},
		lead_time_creacion: {type: dt.DECIMAL},

		editado_por_id: {type: dt.INTEGER},
		editado_en: {type: dt.DATE},
		edic_revisada_por_id: {type: dt.INTEGER},
		edic_revisada_en: {type: dt.DATE},
		lead_time_edicion: {type: dt.DECIMAL},

		status_registro_id: {type: dt.INTEGER},
		motivo_id: {type: dt.INTEGER},
		sugerido_por_id: {type: dt.INTEGER},
		sugerido_en: {type: dt.DATE},

		capturado_por_id: {type: dt.INTEGER},
		capturado_en: {type: dt.DATE},
		captura_activa: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "rclv_4eventos_del_ano",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.dias_del_ano, {as: "dia_del_ano", foreignKey: "dia_del_ano_id"});

		entidad.belongsTo(n.usuarios, {as: "creado_por", foreignKey: "creado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "alta_revisada_por", foreignKey: "alta_revisada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "editado_por", foreignKey: "editado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "edic_revisada_por", foreignKey: "edic_revisada_por_id"});

		entidad.belongsTo(n.status_registros, {as: "status_registro", foreignKey: "status_registro_id"});
		entidad.belongsTo(n.motivos_rech_altas, {as: "motivo", foreignKey: "motivo_id"});
		entidad.belongsTo(n.usuarios, {as: "sugerido_por", foreignKey: "sugerido_por_id"});
		entidad.belongsTo(n.usuarios, {as: "capturado_por", foreignKey: "capturado_por_id"});

		entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "tema_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones", foreignKey: "tema_id"});
		entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "tema_id"});
		entidad.hasMany(n.prods_edicion, {as: "prods_edicion", foreignKey: "tema_id"});

		entidad.hasMany(n.rclvs_edicion, {as: "ediciones", foreignKey: "tema_id"});
	};
	return entidad;
};
