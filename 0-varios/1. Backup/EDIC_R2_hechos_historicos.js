module.exports = (sequelize, dt) => {
	const alias = "RCLV_hechos_historicos";
	const columns = {
		ELC_id: {type: dt.INTEGER},
		dia_del_ano_id: {type: dt.INTEGER},
		ano: {type: dt.INTEGER},
		nombre: {type: dt.STRING(30)},

		editado_por_id: {type: dt.INTEGER},
		editado_en: {type: dt.DATE},
		status_registro_id: {type: dt.INTEGER},
		capturado_por_id: {type: dt.INTEGER},
		capturado_en: {type: dt.DATE},
	};
	const config = {
		tableName: "RCLV_hechos_historicos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.dias_del_ano, {as: "fecha", foreignKey: "dia_del_ano_id"});

		entidad.belongsTo(n.usuarios, {as: "editado_por", foreignKey: "editado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "capturado_por", foreignKey: "capturado_por_id"});
		entidad.belongsTo(n.status_registro_prod, {as: "status_registro", foreignKey: "status_registro_id"});

		entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "hecho_historico_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones", foreignKey: "hecho_historico_id"});
		entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "hecho_historico_id"});
	};
	return entidad;
};
