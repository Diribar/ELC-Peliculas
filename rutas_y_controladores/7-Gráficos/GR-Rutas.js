"use strict";
// Requires ************************************************
const router = express.Router();
const API = require("./GR-ControlAPI");
const vista = require("./GR-ControlVista");

// Middlewares ***********************************************

// API
router.get("/api/cantidad-de-peliculas-por-cfc-y-vpc", API.cantPelisPorCfcVpc);
router.get("/api/vencimiento-de-links-por-semana", API.vencimLinks);
router.get("/api/cantidad-de-links-por-proveedor", API.cantLinksPorProv);

// Vistas *******************************************
router.get("/cantidad-de-peliculas-por-cfc-y-vpc", vista.cantPelisPorCfcVpc);

router.get("/vencimiento-de-links-por-semana", vista.vencimLinks);
router.get("/cantidad-de-links-por-proveedor", vista.cantLinksPorProv);

// Exportarlo **********************************************
module.exports = router;
