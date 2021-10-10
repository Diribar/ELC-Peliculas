module.exports = (sequelize, dt) => {
	const alias = "interes_en_la_pelicula";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		orden: { type: dt.INTEGER },
		nombre: { type: dt.STRING(20) },
	};
	const config = {
		tableName: "interes_en_la_pelicula",
		timestamps: false
	}
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = n => {
		entidad.hasMany(n.us_pel_interes, {as: "us_pel_interes",foreignKey: "interes_id"});
	};
	return entidad;
}