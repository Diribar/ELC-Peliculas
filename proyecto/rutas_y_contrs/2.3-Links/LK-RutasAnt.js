"use strict";
// Variables
const router = express.Router();
const vistaMS = require("../9-Miscelaneas/MS-ControlVista");

// Middlewares - Específicos del registro
const entValidaAnt = require("../../middlewares/porRegistro/entValidaAnt");
const iDvalidoAnt = require("../../middlewares/porRegistro/iDvalidoAnt");
const entId = [entValidaAnt, iDvalidoAnt];

// Vistas
router.get("/abm", entId, vistaMS.redirecciona.rutasAntiguas);
router.get("/visualizacion", entId, vistaMS.redirecciona.rutasAntiguas);

// Fin
module.exports = router;
