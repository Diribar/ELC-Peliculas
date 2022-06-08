module.exports = (sequelize, dt) => {
	const alias = "rclv_edicion";
	const columns = {
		personaje_id: {type: dt.INTEGER},
		hecho_id: {type: dt.INTEGER},
		valor_id: {type: dt.INTEGER},
	
		dia_del_ano_id: {type: dt.INTEGER},
		ano: {type: dt.INTEGER},
		nombre: {type: dt.STRING(30)},
		proceso_canonizacion_id: {type: dt.STRING(3)},
		rol_iglesia_id: {type: dt.STRING(3)},

		editado_por_id: {type: dt.INTEGER},
		editado_en: {type: dt.DATE},
	};
	const config = {
		tableName: "rclv_4edicion",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.personajes, {as: "personajes", foreignKey: "personaje_id"});
		entidad.belongsTo(n.hechos, {as: "hechos", foreignKey: "hecho_id"});
		entidad.belongsTo(n.valores, {as: "valores", foreignKey: "valor_id"});

		entidad.belongsTo(n.dias_del_ano, {as: "fecha", foreignKey: "dia_del_ano_id"});
		entidad.belongsTo(n.procesos_canonizacion, {as: "proceso_canonizacion",	foreignKey: "proceso_canonizacion_id",});
		entidad.belongsTo(n.roles_iglesia, {as: "rol_iglesia", foreignKey: "rol_iglesia_id"});

		entidad.belongsTo(n.usuarios, {as: "editado_por", foreignKey: "editado_por_id"});

	};
	return entidad;
};
