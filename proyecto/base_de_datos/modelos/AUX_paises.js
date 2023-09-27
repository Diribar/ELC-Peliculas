module.exports = (sequelize, dt) => {
	const alias = "paises";
	const columns = {
		id: {type: dt.STRING(2), primaryKey: true},
		alpha3code: {type: dt.STRING(3)},
		nombre: {type: dt.STRING(100)},
		continente: {type: dt.STRING(20)},
		idioma: {type: dt.STRING(50)},
		zonaHoraria: {type: dt.STRING(10)},
		// bandera: {type: dt.STRING(10)},
		cantProds: {type: dt.INTEGER}
	};
	const config = {
		tableName: "aux_paises",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.usuarios, {as: "usuarios", foreignKey: "pais_id"});
		entidad.hasMany(n.usuarios, {as: "documentos", foreignKey: "documPais_id"});
	};
	return entidad;
};
