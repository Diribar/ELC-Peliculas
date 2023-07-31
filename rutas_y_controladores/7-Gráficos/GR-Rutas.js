"use strict";
// Requires ************************************************
const router = express.Router();
const vista = require("./GR-ControlVista");

// Middlewares ***********************************************

// Vistas *******************************************
router.get("/vencimiento-de-links-por-semana", vista.vencimLinks);

// Exportarlo **********************************************
module.exports = router;
