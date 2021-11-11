module.exports = (sequelize, dt) => {
	const alias = "en_castellano";
	const columns = {
		nombre: { type: dt.STRING(10) },
	};
	const config = {
		tableName: "en_castellano",
		timestamps: false
	};
	const entidad = sequelize.define(alias,columns,config);
	return entidad;
};
