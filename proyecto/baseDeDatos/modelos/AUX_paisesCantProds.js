module.exports = (sequelize, dt) => {
	const alias = "paisesCantProds";
	const columns = {
		pais_id: {type: dt.STRING(2), primaryKey: true},
		cantidad: {type: dt.INTEGER}
	};
	const config = {
		tableName: "aux_paises_cant_prods",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.paises, {as: "pais", foreignKey: "pais_id"});
	};
	return entidad;
};
