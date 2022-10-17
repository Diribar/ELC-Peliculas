const JSONTransport = require("nodemailer/lib/json-transport");

module.exports = (sequelize, dt) => {
	const alias = "hechos";
	const columns = {
		nombre: {type: dt.STRING(30)},
		dia_del_ano_id: {type: dt.INTEGER},
		ano: {type: dt.INTEGER},
		hasta: {type: dt.INTEGER},
		perenne: {type: dt.BOOLEAN},

		solo_cfc: {type: dt.BOOLEAN},
		jss: {type: dt.BOOLEAN},
		cnt: {type: dt.BOOLEAN},
		exclusivo: {type: dt.BOOLEAN},
		ap_mar: {type: dt.BOOLEAN},
		
		prods_aprob: {type: dt.BOOLEAN},

		creado_por_id: {type: dt.INTEGER},
		creado_en: {type: dt.DATE},
		alta_analizada_por_id: {type: dt.INTEGER},
		alta_analizada_en: {type: dt.DATE},
		lead_time_creacion: {type: dt.DECIMAL},

		editado_por_id: {type: dt.INTEGER},
		editado_en: {type: dt.DATE},
		edic_analizada_por_id: {type: dt.INTEGER},
		edic_analizada_en: {type: dt.DATE},
		lead_time_edicion: {type: dt.DECIMAL},

		status_registro_id: {type: dt.INTEGER},
		motivo_id: {type: dt.INTEGER},
		sugerido_por_id: {type: dt.INTEGER},
		sugerido_en: {type: dt.DATE},

		capturado_por_id: {type: dt.INTEGER},
		capturado_en: {type: dt.DATE},
		captura_activa: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "rclv_2hechos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.dias_del_ano, {as: "dia_del_ano", foreignKey: "dia_del_ano_id"});

		entidad.belongsTo(n.usuarios, {as: "creado_por", foreignKey: "creado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "alta_analizada_por", foreignKey: "alta_analizada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "editado_por", foreignKey: "editado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "edic_analizada_por", foreignKey: "edic_analizada_por_id"});

		entidad.belongsTo(n.status_registro, {as: "status_registro", foreignKey: "status_registro_id"});
		entidad.belongsTo(n.altas_motivos_rech, {as: "motivo", foreignKey: "motivo_id"});
		entidad.belongsTo(n.usuarios, {as: "sugerido_por", foreignKey: "sugerido_por_id"});
		entidad.belongsTo(n.usuarios, {as: "capturado_por", foreignKey: "capturado_por_id"});

		entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "hecho_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones", foreignKey: "hecho_id"});
		entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "hecho_id"});

		entidad.hasMany(n.prods_edicion, {as: "ediciones_producto", foreignKey: "hecho_id"});

		entidad.hasMany(n.historial_cambios_de_status, {as: "historial", foreignKey: "hecho_id"});
		entidad.hasMany(n.rclvs_edicion, {as: "ediciones", foreignKey: "hecho_id"});
	};
	return entidad;
};
