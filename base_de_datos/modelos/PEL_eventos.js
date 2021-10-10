module.exports = (sequelize, dt) => {
	const alias = "eventos";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		dia: { type: dt.INTEGER },
		mes: { type: dt.INTEGER },
		nombre: { type: dt.STRING(50) },
	};
	const config = {
		tableName: "eventos",
		timestamps: false
	};
	const entidad = sequelize.define(alias,columns,config);
	entidad.associate = n => {
		entidad.hasMany(n.peliculas, {as: "peliculas",foreignKey: "sugerida_para_evento_id"});
	};
	return entidad;
};
