module.exports = (sequelize, dt) => {
	const alias = "RCLV_valores";
	const columns = {
		dia_del_ano_id: {type: dt.INTEGER},
		nombre: {type: dt.STRING(30)},
		cant_prod_creados: {type: dt.INTEGER},
		cant_prod_aprobados: {type: dt.INTEGER},

		creado_por_id: {type: dt.INTEGER},
		creado_en: {type: dt.DATE},
		alta_analizada_en: {type: dt.DATE},
		lead_time_creacion: {type: dt.INTEGER},
		status_registro_id: {type: dt.INTEGER},

		editado_en: {type: dt.DATE},
		edic_analizada_en: {type: dt.DATE},
		lead_time_edicion: {type: dt.INTEGER},

		capturado_por_id: {type: dt.INTEGER},
		capturado_en: {type: dt.DATE},
		captura_activa: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "rclv_3valores",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.usuarios, {as: "creado_por", foreignKey: "creado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "capturado_por", foreignKey: "capturado_por_id"});
		entidad.belongsTo(n.status_registro, {as: "status_registro", foreignKey: "status_registro_id"});

		entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "valor_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones", foreignKey: "valor_id"});
		entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "valor_id"});
		entidad.hasMany(n.prods_edicion, {as: "ediciones", foreignKey: "valor_id"});
	};
	return entidad;
};
