"use strict";
// Requires ************************************************
const router = express.Router();
const API = require("./GR-ControlAPI");
const vista = require("./GR-ControlVista");

// Middlewares ***********************************************

// API
router.get("/api/vencimiento-de-links-por-semana", API.vencimLinks);

// Vistas *******************************************
router.get("/vencimiento-de-links-por-semana", vista.vencimLinks);

// Exportarlo **********************************************
module.exports = router;
