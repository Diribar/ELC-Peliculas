module.exports = (sequelize, dt) => {
	const alias = "RCLV_personajes_historicos";
	const columns = {
		dia_del_ano_id: {type: dt.INTEGER},
		nombre: {type: dt.STRING(30)},
		proceso_canonizacion_id: {type: dt.STRING(3)},
		rol_iglesia_id: {type: dt.STRING(3)},

		creada_por_id: {type: dt.INTEGER},
		creada_en: {type: dt.DATE},
		alta_analizada_por_id: {type: dt.INTEGER},
		alta_analizada_en: {type: dt.DATE},
		lead_time_creacion: {type: dt.INTEGER},
		status_registro_id: {type: dt.INTEGER},

		borrada_motivo_id: {type: dt.INTEGER},
		borrada_motivo_comentario: {type: dt.STRING(500)},

		editada_por_id: {type: dt.INTEGER},
		editada_en: {type: dt.DATE},
		edic_analizada_por_id: {type: dt.INTEGER},
		edic_analizada_en: {type: dt.DATE},
		lead_time_edicion: {type: dt.INTEGER},

		capturada_por_id: {type: dt.INTEGER},
		capturada_en: {type: dt.DATE},
	};
	const config = {
		tableName: "RCLV_personajes_historicos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.dias_del_ano, {as: "fecha", foreignKey: "dia_del_ano_id"});
		entidad.belongsTo(n.procesos_canonizacion, {as: "proceso_canonizacion",	foreignKey: "proceso_canonizacion_id",});
		entidad.belongsTo(n.roles_iglesia, {as: "rol_iglesia", foreignKey: "rol_iglesia_id"});

		entidad.belongsTo(n.usuarios, {as: "creada_por", foreignKey: "creada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "analizada_por", foreignKey: "alta_analizada_por_id"});
		entidad.belongsTo(n.status_registro, {as: "status_registro", foreignKey: "status_registro_id",});
		entidad.belongsTo(n.usuarios, {as: "editada_por", foreignKey: "editada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "edic_analizada_por", foreignKey: "edic_analizada_por_id",});
		entidad.belongsTo(n.usuarios, {as: "capturada_por", foreignKey: "capturada_por_id"});
		entidad.belongsTo(n.motivos_para_borrar, {as: "borrada_motivo", foreignKey: "borrada_motivo_id",});

		entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "personaje_historico_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones", foreignKey: "personaje_historico_id"});
		entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "personaje_historico_id"});
	};
	return entidad;
};
