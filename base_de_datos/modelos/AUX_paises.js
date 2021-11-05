module.exports = (sequelize, dt) => {
	const alias = "paises";
	const columns = {
		alpha3code: {type: dt.STRING(3)},
		nombre: {type: dt.STRING(100)},
		continente: {type: dt.STRING(20)},
		idioma: {type: dt.STRING(50)},
		zona_horaria: {type: dt.STRING(10)},
		// bandera: {type: dt.STRING(10)},
	};
	const config = {
		tableName: "paises",
		timestamps: false
	};
	const entidad = sequelize.define(alias,columns,config);
	entidad.associate = n => {
		entidad.hasMany(n.usuarios, {as: "usuarios",foreignKey: "pais_id"});
	};
	return entidad;
};
