module.exports = (sequelize, dt) => {
	const alias = "calidad_filmica";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		nombre: { type: dt.STRING(20) },
	};
	const config = {
		tableName: "calidad_filmica",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
