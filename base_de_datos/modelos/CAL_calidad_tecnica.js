module.exports = (sequelize, dt) => {
	const alias = "calidad_sonora_visual";
	const columns = {
		orden: { type: dt.INTEGER },
		valor: { type: dt.INTEGER },
		nombre: { type: dt.STRING(20) },
	};
	const config = {
		tableName: "calidad_sonora_visual",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
