"use strict";
// Variables
const router = express.Router();
const API = require("./GR-ControlAPI");
const vista = require("./GR-ControlVista");

// Middlewares - Específicos de usuarios
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/usAltaTerm");
const usRolAutTablEnts = require("../../middlewares/filtrosPorUsuario/usRolAutTablEnts");
const combinados = [usAltaTerm, usRolAutTablEnts];

// API
router.get("/api/peliculas-cfc-vpc", API.pelisCfcVpc);
router.get("/api/peliculas-publico", API.pelisPublico);
router.get("/api/peliculas-epoca-estreno", API.pelisEpocaEstreno);
router.get("/api/links-vencimiento", API.linksVencim);
router.get("/api/links-por-proveedor", API.linksPorProv);
router.get("/api/rangos-sin-efemerides", API.rangosSinEfs);

// Vistas
router.get("/peliculas-cfc-vpc", combinados, vista.pelisCfcVpc);
router.get("/peliculas-publico", combinados, vista.pelisPublico);
router.get("/peliculas-epoca-estreno", combinados, vista.pelisEpocaEstreno);
router.get("/links-vencimiento", combinados, vista.linksVencim);
router.get("/links-por-proveedor", combinados, vista.linksPorProv);
router.get("/rangos-sin-efemerides", combinados, vista.rangosSinEfs);

// Fin
module.exports = router;
