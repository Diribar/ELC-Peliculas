module.exports = (sequelize, dt) => {
	const alias = "idiomas";
	const columns = {
		nombre: {type: dt.STRING(20)},
	};
	const config = {
		tableName: "idiomas",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
