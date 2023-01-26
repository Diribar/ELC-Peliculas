"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./PA-ControlAPI");
const vista = require("./PA-ControlVista");

//************************ Middlewares ******************************
const soloUsuariosCompl = require("../../middlewares/usuarios/solo1-usuariosCompl");
const soloAptoInput = require("../../middlewares/usuarios/solo2-aptoInput");
const prodYaEnBD = require("../../middlewares/producto/prodYaEnBD");
const autorizadoFA = require("../../middlewares/usuarios/autorizadoFA");
const cartelRespons = require("../../middlewares/usuarios/cartelRespons");
const algunos = [soloUsuariosCompl, soloAptoInput];
const todos = [...algunos, prodYaEnBD];
const todosFA = [...algunos, autorizadoFA];
const multer = require("../../middlewares/varios/multer");

//************************ Rutas ****************************
// APIs
// Validar
router.get("/api/valida/palabras-clave", API.validaPalabrasClave);
router.get("/api/valida/datos-duros", API.validaDatosDuros);
router.get("/api/valida/datos-adicionales", API.validaDatosAdics);
router.get("/api/valida/ingreso-fa", API.validaCopiarFA);
// Desambiguar - Form
router.get("/api/desambiguar-form0", API.desambForm0);
router.get("/api/desambiguar-form1", API.desambForm1);
router.get("/api/desambiguar-form2", API.desambForm2);
router.get("/api/desambiguar-form3", API.desambForm3);
// Desambiguar - Guardar
router.get("/api/desambiguar-guardar1", API.desambGuardar1);
router.get("/api/desambiguar-guardar2", API.desambGuardar2);

// Varias
router.get("/api/PC-cant-prods", API.cantProductos);
router.get("/api/IM-colecciones", API.averiguaColecciones);
router.get("/api/IM-cantTemps", API.averiguaCantTemps);
router.get("/api/FA-obtiene-fa-id", API.obtieneFA_id);
router.get("/api/FA-obtiene-elc-id", API.obtieneELC_id);
router.get("/api/DP-guarda-datos-adics/", API.guardaDatosAdics);

// VISTAS
router.get("/palabras-clave", ...algunos, cartelRespons, vista.palabrasClaveForm);
router.post("/palabras-clave", ...algunos, vista.palabrasClaveGuardar);
router.get("/desambiguar", ...algunos, vista.desambiguarForm);
// Comienzo de "prodYaEnBD"
router.get("/datos-duros", ...todos, vista.datosDurosForm);
router.post("/datos-duros", ...todos, multer.single("avatar"), vista.datosDurosGuardar);
router.get("/datos-adicionales", ...todos, vista.datosAdicsForm);
router.post("/datos-adicionales", ...todos, vista.datosAdicsGuardar);
router.get("/confirma", ...todos, vista.confirmaForm);
router.post("/confirma", ...todos, vista.confirmaGuardar);
// Fin de "prodYaEnBD"
// Miscelaneas
router.get("/terminaste", ...algunos, vista.terminasteForm);
router.get("/responsabilidad", soloUsuariosCompl, vista.responsabilidad);
// Ingreso Manual
router.get("/ingreso-manual", ...algunos, autorizadoFA, vista.IM_Form);
router.post("/ingreso-manual", ...algunos, vista.IM_Guardar);
// Ingreso FA
router.post("/ingreso-fa", ...todosFA, vista.copiarFA_Form);
router.get("/ingreso-fa", ...todosFA, vista.copiarFA_Form);
router.post("/ingreso-fa", ...todosFA, vista.copiarFA_Guardar);

// Fin
module.exports = router;
