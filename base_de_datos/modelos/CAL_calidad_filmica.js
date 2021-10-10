module.exports = (sequelize, dt) => {
	const alias = "calidad_sonora_visual";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		nombre: { type: dt.STRING(20) },
	};
	const config = {
		tableName: "calidad_sonora_visual",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
