module.exports = (sequelize, dt) => {
	const alias = "interes_en_prod";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
	};
	const config = {
		tableName: "interes_en_prod",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.us_interes_en_prod, {as: "us_interes_en_prod", foreignKey: "interes_en_prod_id"});
	};
	return entidad;
};
