// Requires ************************************************
const express = require("express");
const router = express.Router();
let API = require("./ControladorAPI");
let vista = require("./ControladorVista");

//************************ Middlewares ******************************
let soloAutInput = require("../../middlewares/usuarios/solo2-aut-input");
let soloGestionProd = require("../../middlewares/usuarios/solo3-gestion-prod");

// Controladores *******************************************
router.get("/vision-general", soloGestionProd, vista.visionGeneral);
router.get("/producto", soloGestionProd, vista.producto);
// router.get("/producto", soloGestionProd, vista.visionGeneral);
// router.get("/rclv", soloGestionProd, vista.visionGeneral);
// router.get("/links", soloGestionProd, vista.visionGeneral);

// Exportarlo **********************************************
module.exports = router;
