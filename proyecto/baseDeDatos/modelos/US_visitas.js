module.exports = (sequelize, dt) => {
	const alias = "visitas";
	const columns = {
		// Datos compartidos con usuario - necesarios en 'session'
		cliente_id: {type: dt.STRING(11)}, // para la vinculación
		versionElc: {type: dt.STRING(4)}, // para las novedades
		fechaUltNaveg: {type: dt.DATE}, // para el contador de 'clientes x día', default 'actual'
		rolUsuario_id: {type: dt.INTEGER}, // para las novedades, default '1'
		diasSinCartelBenefs: {type: dt.INTEGER}, // para mostrar el cartel, default 1

		// Datos compartidos con usuario - innecesarios en 'session'
		diasNaveg: {type: dt.INTEGER}, // para la estadística
		visitaCreadaEn: {type: dt.DATE}, // para la estadística

		// Carteles
		mostrarCartelBienvenida: {type: dt.BOOLEAN}, // default 'true '
		mostrarCartelCookies: {type: dt.BOOLEAN}, // default 'true '
		recienCreado: {type: dt.BOOLEAN}, // default 'true '
	};
	const config = {
		tableName: "us_visitas",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.rolesUsuarios, {as: "rolUsuario", foreignKey: "rolUsuario_id"});
	};
	return entidad;
};
