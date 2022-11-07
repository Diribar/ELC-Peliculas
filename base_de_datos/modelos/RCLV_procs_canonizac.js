module.exports = (sequelize, dt) => {
	const alias = "procs_canoniz";
	const columns = {
		id: {type: dt.STRING(2), primaryKey: true},
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
	};
	const config = {
		tableName: "rclv_proc_canoniz",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.personajes, {as: "personajes", foreignKey: "proceso_id"});
	};
	return entidad;
};
