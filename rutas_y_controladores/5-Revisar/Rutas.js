// Requires ************************************************
const express = require("express");
const router = express.Router();
let API = require("./ControladorAPI");
let vista = require("./ControladorVista");

//************************ Middlewares ******************************
let soloAutInput = require("../../middlewares/usuarios/solo-2-aut-input");
let soloGestionProd = require("../../middlewares/usuarios/solo-3-gestion-prod");

// Controladores *******************************************
router.get("/", soloGestionProd, vista.home);

// Exportarlo **********************************************
module.exports = router;
