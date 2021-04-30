module.exports = (sequelize, dt) => {
	const alias = "sexo";
	const columns = {
		id: {type: dt.STRING(1), primaryKey: true},
		nombre: {type: dt.STRING(100)}
	};
	const config = {
		tableName: "sexo",
		timestamps: false
	};

	const sexo = sequelize.define(alias,columns,config);

	sexo.associate = n => {
		sexo.hasMany(n.usuario, {
			as: "usuarios",
			foreignKey: "sexo_id"
		});
	};

	return sexo;
};
