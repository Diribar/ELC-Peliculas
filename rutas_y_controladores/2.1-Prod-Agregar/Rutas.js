"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./PA-ControlAPI");
const vista = require("./PA-ControlVista");

//************************ Middlewares ******************************
// Específicos de usuarios
const usAltaTerm = require("../../middlewares/usuarios/filtro-usAltaTerm");
const penalizaciones = require("../../middlewares/usuarios/filtro-usPenalizaciones");
const usAptoInput = require("../../middlewares/usuarios/filtro-usAptoInput");
const usAutorizFA = require("../../middlewares/usuarios/filtro-usAutorizFA");
// Específicos de productos
const prodYaEnBD = require("../../middlewares/producto/filtro-prodYaEnBD");
// Consolidados
const dataEntry = [usAltaTerm, penalizaciones, usAptoInput];
const dataEntryMasYaEnBD = [...dataEntry, prodYaEnBD];
const dataEntryMasFA = [...dataEntry, usAutorizFA];
// Otros
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
router.get("/palabras-clave", ...dataEntry, vista.palabrasClaveForm);
router.post("/palabras-clave", ...dataEntry, vista.palabrasClaveGuardar);
router.get("/desambiguar", ...dataEntry, vista.desambiguarForm);
// Comienzo de "prodYaEnBD"
router.get("/datos-duros", ...dataEntryMasYaEnBD, vista.datosDurosForm);
router.post("/datos-duros", ...dataEntryMasYaEnBD, multer.single("avatar"), vista.datosDurosGuardar);
router.get("/datos-adicionales", ...dataEntryMasYaEnBD, vista.datosAdicsForm);
router.post("/datos-adicionales", ...dataEntryMasYaEnBD, vista.datosAdicsGuardar);
router.get("/confirma", ...dataEntryMasYaEnBD, vista.confirmaForm);
router.post("/confirma", ...dataEntryMasYaEnBD, vista.confirmaGuardar);
// Fin de "prodYaEnBD"
router.get("/terminaste", vista.terminaste);
// Ingreso Manual
router.get("/ingreso-manual", ...dataEntry, usAutorizFA, vista.IM_Form);
router.post("/ingreso-manual", ...dataEntry, vista.IM_Guardar);
// Ingreso FA
router.post("/ingreso-fa", ...dataEntryMasFA, vista.copiarFA_Form);
router.get("/ingreso-fa", ...dataEntryMasFA, vista.copiarFA_Form);
router.post("/ingreso-fa", ...dataEntryMasFA, vista.copiarFA_Guardar);

// Fin
module.exports = router;
