module.exports = (sequelize, dt) => {
	const alias = "links_provs";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
		avatar: {type: dt.STRING(20)},
		siempre_pago: {type: dt.BOOLEAN},
		siempre_gratuito: {type: dt.BOOLEAN},
		siempre_completa: {type: dt.BOOLEAN},
		calidad: {type: dt.INTEGER},
		generico: {type: dt.BOOLEAN},
		url_distintivo: {type: dt.STRING(20)},
		buscador_automatico: {type: dt.BOOLEAN},
		url_buscar_pre: {type: dt.STRING(25)},
		trailer: {type: dt.BOOLEAN},
		url_buscar_post_tra: {type: dt.STRING(20)},
		pelicula: {type: dt.BOOLEAN},
		url_buscar_post_pel: {type: dt.STRING(20)},	
	};
	const config = {
		tableName: "links_provs",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.links, {as: "links", foreignKey: "prov_id"});
	};
	return entidad;
};
