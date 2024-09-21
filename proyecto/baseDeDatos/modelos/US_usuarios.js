module.exports = (sequelize, dt) => {
	const alias = "usuarios";
	const columns = {
		cliente_id: {type: dt.STRING(11)},
		versionElc: {type: dt.STRING(4)},
		fechaUltNaveg: {type: dt.DATE},
		rolUsuario_id: {type: dt.INTEGER},
		diasSinCartelBenefs: {type: dt.INTEGER}, // default '0'

		email: {type: dt.STRING(100)},
		contrasena: {type: dt.STRING(50)},

		nombre: {type: dt.STRING(30)},
		apellido: {type: dt.STRING(30)},
		fechaNacim: {type: dt.STRING(10)}, // debe ser string, para poderlo comparar con datos de formularios
		paisNacim_id: {type: dt.STRING(2)},

		apodo: {type: dt.STRING(30)},
		genero_id: {type: dt.STRING(1)},
		pais_id: {type: dt.STRING(2)},
		avatar: {type: dt.STRING(100)},

		cartelResp_prods: {type: dt.BOOLEAN},
		cartelResp_rclvs: {type: dt.BOOLEAN},
		cartelResp_links: {type: dt.BOOLEAN},
		cartelFinPenaliz: {type: dt.BOOLEAN},

		autorizadoFA: {type: dt.BOOLEAN},
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

		intentosLogin: {type: dt.INTEGER},
		intentosDP: {type: dt.INTEGER},
		penalizacAcum: {type: dt.DECIMAL},
		penalizadoEn: {type: dt.DATE},
		penalizadoHasta: {type: dt.DATE},

		fechaContrasena: {type: dt.DATE},
		fechaRevisores: {type: dt.DATE},

		diasNaveg: {type: dt.INTEGER},
		creadoEn: {type: dt.DATE},
		completadoEn: {type: dt.DATE},
		editadoEn: {type: dt.DATE},

		statusRegistro_id: {type: dt.INTEGER},
	};
	const config = {
		tableName: "us_usuarios",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.generos, {as: "genero", foreignKey: "genero_id"});
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
	};
	return entidad;
};
