"use strict";
// Variables
const router = express.Router();
const vistaMS = require("../9-Miscelaneas/MS-ControlVista");

// Middlewares - Específicos del registro
const entValidaAnt = require("../../middlewares/porRegistro/entValidaAnt");
const iDvalidoAnt = require("../../middlewares/porRegistro/iDvalidoAnt");

// Middlewares - Consolidados
const entId = [entValidaAnt, iDvalidoAnt];

// Vistas
router.get("/detalle", entId,  vistaMS.redirecciona.rutasAntiguas);
router.get("/edicion", entId, vistaMS.redirecciona.rutasAntiguas);
router.get("/calificar", entId, vistaMS.redirecciona.rutasAntiguas);

// Fin
module.exports = router;
