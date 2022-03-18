module.exports = (sequelize, dt) => {
	const alias = "links_edicion";
	const columns = {
		elc_id: {type: dt.INTEGER},

		calidad: {type: dt.INTEGER},
		link_tipo_id: {type: dt.INTEGER},
		completo: {type: dt.INTEGER},
		parte: {type: dt.INTEGER},
		gratuito: {type: dt.BOOLEAN},

		editado_por_id: {type: dt.INTEGER},
		editado_en: {type: dt.DATE},

		fecha_referencia: {type: dt.DATE},
		capturado_por_id: {type: dt.INTEGER},
		capturado_en: {type: dt.DATE},
	};
	const config = {
		tableName: "links_2edicion",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.links_originales, {as: "link_original", foreignKey: "elc_id"});
		entidad.belongsTo(n.links_tipos, {as: "link_tipo", foreignKey: "link_tipo_id"});

		entidad.belongsTo(n.usuarios, {as: "editado_por", foreignKey: "editado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "capturado_por", foreignKey: "capturado_por_id"});
	};
	return entidad;
};
