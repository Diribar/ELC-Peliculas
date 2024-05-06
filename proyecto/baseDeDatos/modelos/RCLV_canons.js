module.exports = (sequelize, dt) => {
	const alias = "canons";
	const columns = {
		id: {type: dt.STRING(2), primaryKey: true},
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
		M: {type: dt.STRING(20)},
		F: {type: dt.STRING(20)},
		X: {type: dt.STRING(20)},
	};
	const config = {
		tableName: "rclv_canons",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.personajes, {as: "personajes", foreignKey: "canon_id"});
	};
	return entidad;
};
