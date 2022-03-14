// Requires ************************************************
const express = require("express");
const router = express.Router();
let API = require("./ControladorAPI");
let vista = require("./ControladorVista");

//************************ Middlewares ******************************
let soloAutInput = require("../../middlewares/usuarios/solo-2-aut-input");

// Controladores *******************************************
// Controladores de APIs
router.get("/api/otros-casos/", API.buscarOtrosCasos);
router.get("/api/validar/", API.validarRCLV);

// Controladores de vistas - Relación con la vida
router.get("/redireccionar", soloAutInput, vista.RCLV);
router.get("/personajes", soloAutInput, vista.RCLV_Form);
router.get("/hechos", soloAutInput, vista.RCLV_Form);
router.post("/personajes", soloAutInput, vista.RCLV_Grabar);
router.post("/hechos", soloAutInput, vista.RCLV_Grabar);

// Exportarlo **********************************************
module.exports = router;
