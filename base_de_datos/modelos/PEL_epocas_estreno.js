module.exports = (sequelize, dt) => {
	const alias = "epocas_estreno";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		orden: { type: dt.INTEGER },
		nombre: { type: dt.STRING(20) },
		ano_comienzo: { type: dt.INTEGER },
		ano_fin: { type: dt.INTEGER },
	};
	const config = {
		tableName: "epocas_estreno",
		timestamps: false
	};
	const entidad = sequelize.define(alias,columns,config);
	return entidad;
};
