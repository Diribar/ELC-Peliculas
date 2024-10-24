module.exports = (sequelize, dt) => {
	const alias = "paises";
	const columns = {
		id: {type: dt.STRING(2), primaryKey: true},
		nombre: {type: dt.STRING(100)},
		continente: {type: dt.STRING(20)},
		idioma_id: {type: dt.STRING(2)},
		zonaHoraria: {type: dt.STRING(10)},
		// bandera: {type: dt.STRING(10)},
	};
	const config = {
		tableName: "aux_paises",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.idiomas, {as: "idioma", foreignKey: "idioma_id"});
		entidad.hasOne(n.paisesCantProds, {as: "cantProds", foreignKey: "pais_id"});
		entidad.hasMany(n.usuarios, {as: "usuarios", foreignKey: "pais_id"});
	};
	return entidad;
};
