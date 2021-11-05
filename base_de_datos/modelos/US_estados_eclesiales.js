module.exports = (sequelize, dt) => {
	const alias = "estados_eclesiales";
	const columns = {
		orden: { type: dt.INTEGER },
		nombre: { type: dt.STRING(100) },
	};
	const config = {
		tableName: "estados_eclesiales",
		timestamps: false
	};
	const entidad = sequelize.define(alias,columns,config);
	entidad.associate = n => {
		entidad.hasMany(n.usuarios, {as: "usuarios", foreignKey: "estado_eclesial_id"});
	};
	return entidad;
};
