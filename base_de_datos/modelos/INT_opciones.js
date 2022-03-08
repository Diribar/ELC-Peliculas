module.exports = (sequelize, dt) => {
	const alias = "interes_en_prod";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
	};
	const config = {
		tableName: "int_opciones",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.interes_en_prod, {as: "interes_en_prod", foreignKey: "interes_en_prod_id"});
	};
	return entidad;
};
