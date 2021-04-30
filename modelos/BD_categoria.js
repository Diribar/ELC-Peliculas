const db = require("../database/models");
const entidad = db.Categoria;

module.exports = {
    ObtenerTodas: () => {
        return entidad.findAll();
    }
};