module.exports = (sequelize, dt) => {
	const alias = "interes_en_prod";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		orden: { type: dt.INTEGER },
		nombre: { type: dt.STRING(20) },
	};
	const config = {
		tableName: "interes_en_prod",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = n => {
		entidad.hasMany(n.interes_en_prod_us, {as: "interes_en_prod_us",foreignKey: "interes_en_prod_id"});
	};
	return entidad;
}