module.exports = (sequelize, dt) => {
	const alias = "fe_valores";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		orden: { type: dt.INTEGER },
		valor: { type: dt.INTEGER },
		nombre: { type: dt.STRING(20) },
	};
	const config = {
		tableName: "fe_valores",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
