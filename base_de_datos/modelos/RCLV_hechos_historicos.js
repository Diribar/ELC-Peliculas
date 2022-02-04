module.exports = (sequelize, dt) => {
	const alias = "RCLV_hechos_historicos";
	const columns = {
		dia_del_ano_id: {type: dt.INTEGER},
		ano: {type: dt.INTEGER},
		nombre: {type: dt.STRING(30)},

		creada_por_id: {type: dt.INTEGER},
		creada_en: {type: dt.DATE},
		editada_por_id: {type: dt.INTEGER},
		editada_en: {type: dt.DATE},
		capturada_por_id: {type: dt.INTEGER},
		capturada_en: {type: dt.DATE},

		borrado_id: {type: dt.INTEGER},
	};
	const config = {
		tableName: "RCLV_hechos_historicos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.dias_del_ano, {as: "fecha", foreignKey: "dia_del_ano_id"});

		entidad.belongsTo(n.usuarios, {as: "creada_por", foreignKey: "creada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "editada_por", foreignKey: "editada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "capturada_por", foreignKey: "capturada_por_id"});
		entidad.belongsTo(n.RCLV_borrados, {as: "borrado", foreignKey: "borrado_id"});

		entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "hecho_historico_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones", foreignKey: "hecho_historico_id"});
		entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "hecho_historico_id"});
	};
	return entidad;
};
