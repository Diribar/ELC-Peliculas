module.exports = (sequelize, dt) => {
	const alias = "statusRegistrosUs";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(50)},
		mailPendValidar: {type: dt.BOOLEAN},
		mailValidado: {type: dt.BOOLEAN},
		registrado: {type: dt.BOOLEAN},
		identPendValidar: {type: dt.BOOLEAN},
		identValidada: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "us_status_registro",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.usuarios, {as: "usuarios", foreignKey: "statusRegistro_id"});
	};
	return entidad;
};
