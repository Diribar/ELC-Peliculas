module.exports = (sequelize, dt) => {
	const alias = "rclvs_edicion";
	const columns = {
		personaje_id: {type: dt.INTEGER},
		hecho_id: {type: dt.INTEGER},
		tema_id: {type: dt.INTEGER},
		evento_id: {type: dt.INTEGER},
		epoca_del_ano_id: {type: dt.INTEGER},

		// Comunes
		nombre: {type: dt.STRING(30)},
		dia_del_ano_id: {type: dt.INTEGER},
		ano: {type: dt.INTEGER},
		epoca_id: {type: dt.STRING(3)},

		// Específico de 'personajes'
		apodo: {type: dt.STRING(30)},
		sexo_id: {type: dt.STRING(1)},
		categoria_id: {type: dt.STRING(3)},
		ap_mar_id: {type: dt.INTEGER},
		canon_id: {type: dt.STRING(3)},
		rol_iglesia_id: {type: dt.STRING(3)},

		// Específico de 'hechos'
		solo_cfc: {type: dt.BOOLEAN},
		ama: {type: dt.BOOLEAN},

		editado_por_id: {type: dt.INTEGER},
		editado_en: {type: dt.DATE},
	};
	const config = {
		tableName: "rclv_9edicion",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.personajes, {as: "personaje", foreignKey: "personaje_id"});
		entidad.belongsTo(n.hechos, {as: "hecho", foreignKey: "hecho_id"});
		entidad.belongsTo(n.temas, {as: "tema", foreignKey: "tema_id"});
		entidad.belongsTo(n.eventos_del_ano, {as: "evento", foreignKey: "evento_id"});
		entidad.belongsTo(n.epocas_del_ano, {as: "epoca_del_ano", foreignKey: "epoca_del_ano_id"});

		entidad.belongsTo(n.dias_del_ano, {as: "dia_del_ano", foreignKey: "dia_del_ano_id"});
		
		entidad.belongsTo(n.sexos, {as: "sexo", foreignKey: "sexo_id"});
		entidad.belongsTo(n.categorias, {as: "categoria", foreignKey: "categoria_id"});
		entidad.belongsTo(n.epocas, {as: "epoca", foreignKey: "epoca_id"});
		entidad.belongsTo(n.hechos, {as: "ap_mar", foreignKey: "ap_mar_id"});
		entidad.belongsTo(n.canons, {as: "canon",	foreignKey: "canon_id",});
		entidad.belongsTo(n.roles_iglesia, {as: "rol_iglesia", foreignKey: "rol_iglesia_id"});

		entidad.belongsTo(n.usuarios, {as: "editado_por", foreignKey: "editado_por_id"});
	};
	return entidad;
};
