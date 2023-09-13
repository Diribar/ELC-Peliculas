module.exports = (sequelize, dt) => {
	const alias = "linksProvs";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},

		abierto: {type: dt.BOOLEAN},
		permUso: {type: dt.BOOLEAN},
		cantLinks: {type: dt.INTEGER},

		avatar: {type: dt.STRING(20)},
		siemprePago: {type: dt.BOOLEAN},
		siempreGratuito: {type: dt.BOOLEAN},
		siempreCompleta: {type: dt.BOOLEAN},
		calidad: {type: dt.INTEGER},
		generico: {type: dt.BOOLEAN},
		urlDistintivo: {type: dt.STRING(20)},
		mostrarSiempre: {type: dt.BOOLEAN},
		urlBuscarPre: {type: dt.STRING(25)},
		trailer: {type: dt.BOOLEAN},
		pelicula: {type: dt.BOOLEAN},
		urlBuscarPost: {type: dt.STRING(20)},
		urlCopyright: {type: dt.STRING(70)},
		urlHome: {type: dt.STRING(30)},
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
