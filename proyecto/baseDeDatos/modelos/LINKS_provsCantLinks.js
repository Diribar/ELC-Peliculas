module.exports = (sequelize, dt) => {
	const alias = "linksProvsCantLinks";
	const columns = {
		link_id: {type: dt.INTEGER},
		cantidad: {type: dt.INTEGER},
	};
	const config = {
		tableName: "links_provs_cant_links",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.linksProvs, {as: "link", foreignKey: "link_id"});
	};
	return entidad;
};
