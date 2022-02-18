module.exports = (sequelize, dt) => {
	const alias = "links_provs";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
		avatar: {type: dt.STRING(20)},
		siempre_pago: {type: dt.BOOLEAN},
		generico: {type: dt.BOOLEAN},
		url_distintivo: {type: dt.STRING(20)},
		buscador_automatico: {type: dt.BOOLEAN},
		url_buscar_pre: {type: dt.STRING(25)},
		url_buscar_post: {type: dt.STRING(20)},
	};
	const config = {
		tableName: "links_provs",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.links_prod, {as: "links", foreignKey: "link_prov_id"});
	};
	return entidad;
};
