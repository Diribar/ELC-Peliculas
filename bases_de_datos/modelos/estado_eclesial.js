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

	const estado_eclesial = sequelize.define(alias,columns,config);

	estado_eclesial.associate = n => {
		estado_eclesial.hasMany(n.usuario, {
			as: "usuarios",
			foreignKey: "estado_eclesial_id"
		});
	};

	return estado_eclesial;
};
