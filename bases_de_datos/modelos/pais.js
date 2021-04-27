module.exports = (sequelize, dt) => {
	const alias = "pais";
	const columns = {
		iso_id: {type: dt.STRING(2), primaryKey: true},
		nombre: {type: dt.STRING(100)}
	};
	const config = {
		tableName: "paises",
		timestamps: false
	};

	const pais = sequelize.define(alias,columns,config);

	pais.associate = n => {
		pais.hasMany(n.usuario, {
			as: "usuarios",
			foreignKey: "pais_id"
		});
	};

	return pais;
};
