module.exports = (sequelize, dt) => {
	const alias = "links_prods_edic";
	const columns = {
		ELC_id: {type: dt.INTEGER},
		url: {type: dt.STRING(100)},
		link_tipo_id: {type: dt.INTEGER},
		link_prov_id: {type: dt.INTEGER},
		gratuito: {type: dt.BOOLEAN},

		
		editado_por_id: {type: dt.INTEGER},
		editado_en: {type: dt.DATE},
		status_registro_id: {type: dt.INTEGER},
		capturado_por_id: {type: dt.INTEGER},
		capturado_en: {type: dt.DATE},
	};
	const config = {
		tableName: "links_prods",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.links_prods, {as: "link_prod", foreignKey: "ELC_id"});
		entidad.belongsTo(n.links_tipos, {as: "link_tipo", foreignKey: "link_tipo_id"});
		entidad.belongsTo(n.links_provs, {as: "link_prov", foreignKey: "link_prov_id"});

		entidad.belongsTo(n.usuarios, {as: "editado_por", foreignKey: "editado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "capturado_por", foreignKey: "capturado_por_id"});
		entidad.belongsTo(n.status_registro_prod, {as: "status_registro", foreignKey: "status_registro_id"});
	};
	return entidad;
};
