"use strict";
// Variables
const router = express.Router();
const vista = require("./LK-ControlVista");

// Middlewares - Específicos del registro
const linkIDvalido = require("../../middlewares/porRegistro/linkIDvalido");
const entValidaAnt = require("../../middlewares/porRegistro/entValidaAnt");
const iDvalidoAnt = require("../../middlewares/porRegistro/iDvalidoAnt");
const entId = [entValidaAnt, iDvalidoAnt];

// Vistas
router.get("/abm", entId, vista.abm);
router.get("/visualizacion", linkIDvalido, vista.visualizacion);

// Fin
module.exports = router;
