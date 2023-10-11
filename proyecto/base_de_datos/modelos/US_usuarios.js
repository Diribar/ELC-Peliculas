module.exports = (sequelize, dt) => {
	const alias = "usuarios";
	const columns = {
		email: {type: dt.STRING(100)},
		contrasena: {type: dt.STRING(50)},
		nombre: {type: dt.STRING(30)},
		apellido: {type: dt.STRING(30)},
		apodo: {type: dt.STRING(30)},
		avatar: {type: dt.STRING(100)},
		fechaNacim: {type: dt.DATE},
		sexo_id: {type: dt.STRING(1)},
		pais_id: {type: dt.STRING(2)},
		rolIglesia_id: {type: dt.STRING(3)},
		rolUsuario_id: {type: dt.INTEGER},

		cartelResp_prods: {type: dt.BOOLEAN},
		cartelResp_rclvs: {type: dt.BOOLEAN},
		cartelResp_links: {type: dt.BOOLEAN},
		cartelFinPenaliz: {type: dt.BOOLEAN},

		autorizadoFA: {type: dt.BOOLEAN},
		documNumero: {type: dt.STRING(15)},
		documPais_id: {type: dt.STRING(2)},
		documAvatar: {type: dt.STRING(18)},

		diasLogin: {type: dt.INTEGER},
		versionElcUltimoLogin: {type: dt.STRING(4)},

		fechaUltimoLogin: {type: dt.DATE},
		fechaContrasena: {type: dt.DATE},
		fechaRevisores: {type: dt.DATE},
		configCons_id: {type: dt.INTEGER},
		videoConsVisto: {type: dt.BOOLEAN},

		creadoEn: {type: dt.DATE},
		completadoEn: {type: dt.DATE},
		editadoEn: {type: dt.DATE},

		prodsAprob: {type: dt.INTEGER},
		prodsRech: {type: dt.INTEGER},
		rclvsAprob: {type: dt.INTEGER},
		rclvsRech: {type: dt.INTEGER},
		linksAprob: {type: dt.INTEGER},
		linksRech: {type: dt.INTEGER},
		edicsAprob: {type: dt.INTEGER},
		edicsRech: {type: dt.INTEGER},

		penalizacAcum: {type: dt.DECIMAL},
		penalizadoEn: {type: dt.DATE},
		penalizadoHasta: {type: dt.DATE},

		capturadoPor_id: {type: dt.INTEGER},
		capturadoEn: {type: dt.DATE},
		capturaActiva: {type: dt.BOOLEAN},

		statusRegistro_id: {type: dt.INTEGER},
	};
	const config = {
		tableName: "usuarios",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.sexos, {as: "sexo", foreignKey: "sexo_id"});
		entidad.belongsTo(n.paises, {as: "pais", foreignKey: "pais_id"});
		entidad.belongsTo(n.rolesUsuarios, {as: "rolUsuario", foreignKey: "rolUsuario_id"});
		entidad.belongsTo(n.rolesIglesia, {as: "rolIglesia", foreignKey: "rolIglesia_id"});
		entidad.belongsTo(n.statusRegistrosUs, {as: "statusRegistro", foreignKey: "statusRegistro_id"});
		entidad.belongsTo(n.paises, {as: "docum_pais", foreignKey: "documPais_id"});

		entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "creadoPor_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones", foreignKey: "creadoPor_id"});
		entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "creadoPor_id"});

		entidad.hasMany(n.cal_registros, {as: "calificaciones", foreignKey: "usuario_id"});
		entidad.hasMany(n.pppRegistros, {as: "prefPorProd", foreignKey: "usuario_id"});
		entidad.hasMany(n.histDetsPeli, {as: "histDetsPeli", foreignKey: "usuario_id"});

		entidad.belongsTo(n.usuarios, {as: "capturado_por", foreignKey: "capturadoPor_id"});
	};
	return entidad;
};
