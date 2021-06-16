module.exports = (sequelize, dt) => {
	const alias = "listados";
	const columns = {
		id: {type: dt.INTEGER, primaryKey: true},
		nombre: {type: dt.STRING(50)}
	};
	const config = {
		tableName: "listados",
		timestamps: false,
	};
	const entidad = sequelize.define(alias,columns,config);
	entidad.associate = n => {
	};
	return entidad;
};
