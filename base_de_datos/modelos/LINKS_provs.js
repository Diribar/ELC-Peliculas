module.exports = (sequelize, dt) => {
	const alias = "linksProvs";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
		avatar: {type: dt.STRING(20)},
		siemprePago: {type: dt.BOOLEAN},
		siempreGratuito: {type: dt.BOOLEAN},
		siempreCompleta: {type: dt.BOOLEAN},
		calidad: {type: dt.INTEGER},
		generico: {type: dt.BOOLEAN},
		url_distintivo: {type: dt.STRING(20)},
		buscadorAutom: {type: dt.BOOLEAN},
		url_buscarPre: {type: dt.STRING(25)},
		trailer: {type: dt.BOOLEAN},
		url_buscarPostTra: {type: dt.STRING(20)},
		pelicula: {type: dt.BOOLEAN},
		url_buscarPostPel: {type: dt.STRING(20)},	
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
