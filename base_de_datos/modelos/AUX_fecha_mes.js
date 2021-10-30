module.exports = (sequelize, dt) => {
	const alias = "mes";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		nombre: { type: dt.STRING(20) },
	};
	const config = {
		tableName: "mes ",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
