module.exports = (sequelize, dt) => {
	const alias = "usuarios";
	const columns = {
		email: {type: dt.STRING(100)},
		contrasena: {type: dt.STRING(50)},

		nombre: {type: dt.STRING(30)},
		apellido: {type: dt.STRING(30)},
		fechaNacim: {type: dt.STRING(10)}, // debe ser string, para poderlo comparar con datos de formularios
		paisNacim_id: {type: dt.STRING(2)},

		apodo: {type: dt.STRING(30)},
		sexo_id: {type: dt.STRING(1)},
		pais_id: {type: dt.STRING(2)},
		avatar: {type: dt.STRING(100)},
		rolUsuario_id: {type: dt.INTEGER},

		cartelResp_prods: {type: dt.BOOLEAN},
		cartelResp_rclvs: {type: dt.BOOLEAN},
		cartelResp_links: {type: dt.BOOLEAN},
		cartelFinPenaliz: {type: dt.BOOLEAN},

		autorizadoFA: {type: dt.BOOLEAN},
		diasLogin: {type: dt.INTEGER},
		versionElcUltimoLogin: {type: dt.STRING(4)},
		configCons_id: {type: dt.INTEGER},
		videoConsVisto: {type: dt.BOOLEAN},

		prodsAprob: {type: dt.INTEGER},
		prodsRech: {type: dt.INTEGER},
		rclvsAprob: {type: dt.INTEGER},
		rclvsRech: {type: dt.INTEGER},
		linksAprob: {type: dt.INTEGER},
		linksRech: {type: dt.INTEGER},
		edicsAprob: {type: dt.INTEGER},
		edicsRech: {type: dt.INTEGER},

		intentosRecupContr: {type: dt.INTEGER},
		penalizacAcum: {type: dt.DECIMAL},
		penalizadoEn: {type: dt.DATE},
		penalizadoHasta: {type: dt.DATE},

		fechaUltimoLogin: {type: dt.DATE},
		fechaContrasena: {type: dt.DATE},
		fechaRevisores: {type: dt.DATE},

		creadoEn: {type: dt.DATE},
		completadoEn: {type: dt.DATE},
		editadoEn: {type: dt.DATE},

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
		entidad.belongsTo(n.statusRegistrosUs, {as: "statusRegistro", foreignKey: "statusRegistro_id"});
		entidad.belongsTo(n.paises, {as: "paisNacim", foreignKey: "paisNacim_id"});

		entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "creadoPor_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones", foreignKey: "creadoPor_id"});
		entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "creadoPor_id"});

		entidad.hasMany(n.calRegistros, {as: "calificaciones", foreignKey: "usuario_id"});
		entidad.hasMany(n.pppRegistros, {as: "prefPorProd", foreignKey: "usuario_id"});
		entidad.hasMany(n.misConsultas, {as: "misConsultas", foreignKey: "usuario_id"});

		entidad.belongsTo(n.usuarios, {as: "capturadoPor", foreignKey: "capturadoPor_id"});
	};
	return entidad;
};
