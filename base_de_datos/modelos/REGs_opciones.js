module.exports = (sequelize, dt) => {
	const alias = "regs_opciones";
	const columns = {
		nombre: {type: dt.STRING(20)},
	};
	const config = {
		tableName: "regs_opciones",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
