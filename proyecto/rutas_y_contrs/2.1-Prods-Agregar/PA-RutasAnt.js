"use strict";
// Variables
const router = express.Router();
const vistaMS = require("../9-Miscelaneas/MS-ControlVista");

// Middlewares
const entValidaAnt = require("../../middlewares/porRegistro/entValidaAnt");
const idValidoAnt = require("../../middlewares/porRegistro/idValidoAnt");
const entId = [entValidaAnt, idValidoAnt];

// FN Redireccionamiento

// Vistas
router.get("/:paso", entId, vistaMS.redirecciona.rutasAntiguas);

// Fin
module.exports = router;
