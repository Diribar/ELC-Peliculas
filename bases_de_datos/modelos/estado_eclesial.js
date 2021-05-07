module.exports = (sequelize, dt) => {
	const alias = "estado_eclesial";
	const columns = {
		id: {type: dt.STRING(2), primaryKey: true},
		nombre: {type: dt.STRING(100)}
	};
	const config = {
		tableName: "estados_eclesiales",
		timestamps: false
	};

	const entidad = sequelize.define(alias,columns,config);

	entidad.associate = n => {
		entidad.hasMany(n.usuario, {
			as: "usuarios",
			foreignKey: "estado_eclesial_id"
		});
	};

	return entidad;
};
