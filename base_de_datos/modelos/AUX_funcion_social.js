module.exports = (sequelize, dt) => {
	const alias = "funcion_social";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		grupo_id: { type: dt.INTEGER },
		orden: { type: dt.INTEGER },
		nombre: { type: dt.STRING(20) },
		creada_por_id: { type: dt.INTEGER },
		creada_en: { type: dt.DATE },
	};
	const config = {
		tableName: "funcion_social ",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.funcion_social_grupo, {as: "grupo", foreignKey: "grupo_id"});
		entidad.belongsTo(n.usuarios, {as: "usuario", foreignKey: "creada_por_id"});
	};
	return entidad;
};
