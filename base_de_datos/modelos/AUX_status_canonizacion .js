module.exports = (sequelize, dt) => {
	const alias = "status_canonizacion";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		orden: { type: dt.INTEGER },
		nombre: { type: dt.STRING(20) },
		creada_por_id: { type: dt.INTEGER },
		creada_en: { type: dt.DATE },
	};
	const config = {
		tableName: "status_canonizacion",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.usuarios, {as: "usuario", foreignKey: "creada_por_id"});
	};
	return entidad;
};
