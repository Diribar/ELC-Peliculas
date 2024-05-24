"use strict";
// Variables
const router = express.Router();
const API = require("./LK-ControlAPI");
const vista = require("./LK-ControlVista");

// Middlewares - Específicos de usuarios
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/usPenalizaciones");
const usAptoInput = require("../../middlewares/filtrosPorUsuario/usAptoInput");

// Middlewares - Específicos de entidades
const entValida = require("../../middlewares/filtrosPorRegistro/entidadValida");
const IDvalido = require("../../middlewares/filtrosPorRegistro/IDvalido");
const statusCorrecto = require("../../middlewares/filtrosPorRegistro/statusCorrecto");

// Middlewares - Temas de captura
const permUserReg = require("../../middlewares/filtrosPorRegistro/permUserReg");
const capturaActivar = require("../../middlewares/varios/capturaActivar");

// Middlewares - Otros
const rutaCRUD_ID = require("../../middlewares/varios/rutaCRUD_ID");

// Middlewares - Consolidados
const aptoUsuario = [usAltaTerm, usPenalizaciones, usAptoInput];
const aptoABM = [...aptoUsuario, entValida, IDvalido, statusCorrecto, permUserReg, rutaCRUD_ID];

// APIs - Links
router.get("/api/valida", API.valida);
router.get("/api/obtiene-provs-links", API.obtieneProvs);

// APIs - ABM
router.get("/api/guardar", API.guarda);
router.get("/api/inactiva-o-elimina", API.inactivaElimina);
router.get("/api/recuperar", API.recupera);
router.get("/api/deshacer", API.deshace);

// Vistas
router.get("/abm", aptoABM, capturaActivar, vista.abm);
router.get("/visualizacion", vista.visualizacion);

// Fin
module.exports = router;
