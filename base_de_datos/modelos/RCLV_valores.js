module.exports = (sequelize, dt) => {
	const alias = "RCLV_valores";
	const columns = {
		nombre: {type: dt.STRING(30)},

		status_registro_id: {type: dt.INTEGER},
		creada_por_id: {type: dt.INTEGER},
		creada_en: {type: dt.DATE},
		editada_por_id: {type: dt.INTEGER},
		editada_en: {type: dt.DATE},
		lead_time_edicion: {type: dt.INTEGER},
		revisada_por_id: {type: dt.INTEGER},
		revisada_en: {type: dt.DATE},
		borrada_motivo_id: {type: dt.INTEGER},
		borrada_motivo_comentario: {type: dt.STRING(500)},
		capturada_por_id: {type: dt.INTEGER},
		capturada_en: {type: dt.DATE},
	};
	const config = {
		tableName: "RCLV_valores",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.status_registro, {as: "status_registro", foreignKey: "status_registro_id"});
		entidad.belongsTo(n.usuarios, {as: "creada_por", foreignKey: "creada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "editada_por", foreignKey: "editada_por_id"});
		entidad.belongsTo(n.motivos_para_borrar, {as: "borrada_motivo", foreignKey: "borrada_motivo_id"});
		entidad.belongsTo(n.usuarios, {as: "revisada_por", foreignKey: "revisada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "capturada_por", foreignKey: "capturada_por_id"});

		entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "hecho_historico_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones", foreignKey: "hecho_historico_id"});
		entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "hecho_historico_id"});
	};
	return entidad;
};
