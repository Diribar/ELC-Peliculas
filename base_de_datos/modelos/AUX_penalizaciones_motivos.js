module.exports = (sequelize, dt) => {
	const alias = "penalizaciones_motivos";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(50)},
		duracion: {type: dt.INTEGER},
		comentario: {type: dt.STRING(100)},
	};
	const config = {
		tableName: "penalizaciones_motivos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.penalizaciones_usuarios, {as: "penalizaciones_usuarios", foreignKey: "penalizacion_id"});
	};
	return entidad;
};
