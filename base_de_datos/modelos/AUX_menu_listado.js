module.exports = (sequelize, dt) => {
	const alias = "listado_peliculas";
	const columns = {
		orden: { type: dt.INTEGER },
		nombre: { type: dt.STRING(50) },
		url: { type: dt.STRING(50) },
	};
	const config = {
		tableName: "listado_peliculas",
		timestamps: false,
	};
	const entidad = sequelize.define(alias,columns,config);
	return entidad;
};
