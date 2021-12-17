module.exports = (sequelize, dt) => {
	const alias = "procesos_canonizacion";
	const columns = {
		id: {type: dt.STRING(2), primaryKey: true},
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(100)},
	};
	const config = {
		tableName: "procesos_canonizacion",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.historicos_personajes, {as: "personajes", foreignKey: "proceso_canonizacion_id"});
	};
	return entidad;
};
