module.exports = (sequelize, dt) => {
	const alias = "sexos";
	const columns = {
		nombre: {type: dt.STRING(20)},
		letra_final: {type: dt.STRING(1)},
	};
	const config = {
		tableName: "sexos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.usuarios, {as: "usuarios", foreignKey: "sexo_id"});
	};
	return entidad;
};
