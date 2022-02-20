// Requires ************************************************
const express = require("express");
const router = express.Router();
let API = require("./ControladorAPI");
let vista = require("./ControladorVista");

//************************ Middlewares ******************************
let soloAutInput = require("../../middlewares/usuarios/solo-2-aut-input");

// Controladores *******************************************
// Controladores de APIs
router.get("/agregar/api/rclv-otros-casos/", API.buscarOtrosCasos);
router.get("/agregar/api/rclv/", API.validarRCLV);
router.get("/quick-search/", API.quickSearch);

// Controladores de vistas - Institucional
router.get("/", vista.home);
router.get("/nosotros", vista.nosotros);

// Controladores de vistas - Relación con la vida
router.get("/agregar/relacion-vida", soloAutInput, vista.RCLV);
router.get("/agregar/RCLV_personajes", soloAutInput, vista.RCLV_Form);
router.get("/agregar/RCLV_hechos", soloAutInput, vista.RCLV_Form);
router.post("/agregar/RCLV_personajes", soloAutInput, vista.RCLV_Grabar);
router.post("/agregar/RCLV_hechos", soloAutInput, vista.RCLV_Grabar);

// Errores
router.get("/error/producto-no-encontrado", vista.prodNoEncontrado);
router.get("/error/producto-no-aprobado", vista.prodNoAprobado);

// Miscelaneas
router.get("/session", vista.session);
router.get("/cookies", vista.cookies);

// Exportarlo **********************************************
module.exports = router;
