module.exports = (sequelize, dt) => {
	const alias = "status_registro_us";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(50)},
		mail_validado: {type: dt.BOOLEAN},
		datos_perennes: {type: dt.BOOLEAN},
		datos_editables: {type: dt.BOOLEAN},
		documento: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "us_status_registro",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.usuarios, {as: "usuarios", foreignKey: "status_registro_id"});
	};
	return entidad;
};
