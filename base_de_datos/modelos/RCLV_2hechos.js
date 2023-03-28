module.exports = (sequelize, dt) => {
	const alias = "hechos";
	const columns = {
		nombre: {type: dt.STRING(30)},
		prods_aprob: {type: dt.INTEGER},
		avatar: {type: dt.STRING(15)},

		dia_del_ano_id: {type: dt.INTEGER},
		ano: {type: dt.INTEGER},
		epoca_id: {type: dt.STRING(3)},

		// Específico de 'hechos'
		solo_cfc: {type: dt.BOOLEAN},
		ama: {type: dt.BOOLEAN},

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
		tableName: "rclv_2hechos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.dias_del_ano, {as: "dia_del_ano", foreignKey: "dia_del_ano_id"});
		entidad.belongsTo(n.epocas, {as: "epoca", foreignKey: "epoca_id"});

		entidad.belongsTo(n.usuarios, {as: "creado_por", foreignKey: "creado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "alta_revisada_por", foreignKey: "alta_revisada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "editado_por", foreignKey: "editado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "edic_revisada_por", foreignKey: "edic_revisada_por_id"});

		entidad.belongsTo(n.status_registros, {as: "status_registro", foreignKey: "status_registro_id"});
		entidad.belongsTo(n.motivos_rech_altas, {as: "motivo", foreignKey: "motivo_id"});
		entidad.belongsTo(n.usuarios, {as: "sugerido_por", foreignKey: "sugerido_por_id"});
		entidad.belongsTo(n.usuarios, {as: "capturado_por", foreignKey: "capturado_por_id"});

		entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "hecho_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones", foreignKey: "hecho_id"});
		entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "hecho_id"});
		entidad.hasMany(n.prods_edicion, {as: "prods_edicion", foreignKey: "hecho_id"});

		entidad.hasMany(n.rclvs_edicion, {as: "ediciones", foreignKey: "hecho_id"});
	};
	return entidad;
};
