module.exports = (sequelize, dt) => {
	const alias = "linksProvs";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},

		avatar: {type: dt.STRING(20)},
		abierto: {type: dt.BOOLEAN},
		permUso: {type: dt.BOOLEAN},
		trailer: {type: dt.BOOLEAN},
		pelicula: {type: dt.BOOLEAN},
		siemprePago: {type: dt.BOOLEAN},
		siempreGratuito: {type: dt.BOOLEAN},
		siempreCompleta: {type: dt.BOOLEAN},
		calidad: {type: dt.INTEGER},

		urlBuscarPre: {type: dt.STRING(25)},
		urlBuscarPost: {type: dt.STRING(20)},
		urlDistintivo: {type: dt.STRING(20)},
		urlCopyright: {type: dt.STRING(70)},

		mostrarSiempre: {type: dt.BOOLEAN},
		generico: {type: dt.BOOLEAN},
		cantLinks: {type: dt.INTEGER},
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
