module.exports = (sequelize, dt) => {
	const alias = "interes_opciones";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
	};
	const config = {
		tableName: "int_opciones",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.interes_registros, {as: "registros", foreignKey: "interes_id"});
	};
	return entidad;
};
