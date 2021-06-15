module.exports = (sequelize, dt) => {
    const alias = "us_pel_interes";
    const columns  = {
		id: {type: dt.INTEGER, primaryKey: true},
		usuario_id: {type: dt.INTEGER},
		pelicula_id: {type: dt.INTEGER},
		interes_id: {type: dt.INTEGER},
    }
    const config = {
	tableName: "us_pel_interes_en_la_pelicula",
	timestamps: false
    }
    const entidad = sequelize.define(alias, columns, config);
	entidad.associate = n => {
		entidad.belongsTo(n.interes_en_la_pelicula, {as: "interes_en_la_pelicula", foreignKey: "interes_id"});
		entidad.belongsTo(n.usuarios, {as: "usuario", foreignKey: "usuario_id"});
		entidad.belongsTo(n.peliculas, {as: "pelicula", foreignKey: "pelicula_id"});
	};
    return entidad;
}