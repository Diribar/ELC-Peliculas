module.exports = (sequelize, dt) => {
	const alias = "rclvs_edicion";
	const columns = {
		personaje_id: {type: dt.INTEGER},
		hecho_id: {type: dt.INTEGER},
		valor_id: {type: dt.INTEGER},
	
		nombre: {type: dt.STRING(30)},
		dia_del_ano_id: {type: dt.INTEGER},
		ano: {type: dt.INTEGER},
		ap_mar: {type: dt.BOOLEAN},

		// Campos para PERSONAJES
		categoria_id: {type: dt.STRING(3)},
		subcategoria_id: {type: dt.STRING(3)},
		ap_mar_id: {type: dt.INTEGER},
		proceso_id: {type: dt.STRING(3)},
		rol_iglesia_id: {type: dt.STRING(3)},

		// Campos para HECHOS
		solo_cfc: {type: dt.BOOLEAN},
		jss: {type: dt.BOOLEAN},
		cnt: {type: dt.BOOLEAN},
		exclusivo: {type: dt.BOOLEAN},

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

		entidad.belongsTo(n.usuarios, {as: "editado_por", foreignKey: "editado_por_id"});

	};
	return entidad;
};
