"use strict";
// Variables
const router = express.Router();
const API = require("./CN-ControlAPI");
const vista = require("./CN-ControlVista");

// API - Obtiene
router.get("/api/obtiene-la-configuracion-de-cabecera", API.obtiene.configCabecera);
router.get("/api/obtiene-la-configuracion-de-campos", API.obtiene.configCampos);
router.get("/api/obtiene-las-configs-posibles-para-el-usuario", API.obtiene.configsDeCabecera);
router.get("/api/obtiene-variables-del-back-end", API.obtiene.variables);

// API - Cambios en BD
router.get("/api/actualiza-configCons_id-en-cookie-session-y-usuario", API.cambiosEnBD.configCons_id);
router.get("/api/crea-una-configuracion", API.cambiosEnBD.creaConfig);
router.get("/api/guarda-una-configuracion", API.cambiosEnBD.guardaConfig);
router.get("/api/elimina-configuracion-de-consulta", API.cambiosEnBD.eliminaConfigCons);

// API - Resultados
router.get("/api/obtiene-los-resultados", API.resultados);

// Vistas
router.get("/", vista.consultas);

// Fin
module.exports = router;
