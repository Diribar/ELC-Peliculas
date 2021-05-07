module.exports = (sequelize, dt) => {
	const alias = "sexo";
	const columns = {
		id: {type: dt.STRING(1), primaryKey: true},
		nombre: {type: dt.STRING(100)}
	};
	const config = {
		tableName: "sexos",
		timestamps: false
	};

	const entidad = sequelize.define(alias,columns,config);

	entidad.associate = n => {
		entidad.hasMany(n.usuario, {
			as: "usuarios",
			foreignKey: "sexo_id"
		});
	};

	return entidad;
};
