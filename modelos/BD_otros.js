const db = require("../bases_de_datos/modelos");

module.exports = {
    listadoCompleto: (entidad) => {
        return db[entidad].findAll();
    }
};