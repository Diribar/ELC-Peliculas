module.exports = (sequelize, dt) => {
	const alias = "linksTipos";
	const columns = {
		nombre: {type: dt.STRING(10)},
		pelicula: {type: dt.BOOLEAN},
		trailer: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "links_tipos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.links, {as: "links", foreignKey: "tipo_id"});
	};
	return entidad;
};
