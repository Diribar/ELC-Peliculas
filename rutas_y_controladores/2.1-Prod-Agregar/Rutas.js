"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./ControladorAPI");
const vista = require("./ControladorVista");

//************************ Middlewares ******************************
const soloUsuarios = require("../../middlewares/usuarios/solo1-usuarios");
const aptoInput = require("../../middlewares/usuarios/aptoInput");
const prodYaEnBD = require("../../middlewares/producto/prodYaEnBD");
const autorizadoFA = require("../../middlewares/usuarios/autorizadoFA");
const cartelRespons = require("../../middlewares/usuarios/cartelRespons");
const algunos = [soloUsuarios, aptoInput];
const todos = [...algunos, prodYaEnBD];
const todosFA = [...algunos, autorizadoFA];
const entidad = require("../../middlewares/producto/entidadNombre");
const id = require("../../middlewares/producto/entidadID");
const multer = require("../../middlewares/varios/multer");

//************************ Rutas ****************************
// APIs
// Validar
router.get("/api/valida/palabras-clave", API.validaPalabrasClave);
router.get("/api/valida/datos-duros", API.validaDatosDuros);
router.get("/api/valida/datos-personalizados", API.validaDatosPers);
router.get("/api/valida/copiar-fa", API.validaCopiarFA);
// Desambiguar - Form
router.get("/api/desambiguar-form0", API.desambForm0);
router.get("/api/desambiguar-form1", API.desambForm1);
router.get("/api/desambiguar-form2", API.desambForm2);
// Desambiguar - Guardar
router.get("/api/desambiguar-guardar1", API.desambGuardar1);
router.get("/api/desambiguar-guardar2", API.desambGuardar2);
router.get("/api/desambiguar-guardar3", API.desambGuardar3);
router.get("/api/desambiguar-guardar4", API.desambGuardar4);
router.get("/api/desambiguar-guardar5", API.desambGuardar5);
router.get("/api/desambiguar-guardar6", API.desambGuardar6);

// Varias
router.get("/api/PC-cant-prod", API.cantProductos);
router.get("/api/DS-averigua-coleccion", API.averiguaColeccion);
router.get("/api/TP-averigua-colecciones", API.averiguaColecciones);
router.get("/api/TP-averigua-cant-temporadas", API.averiguaCantTemporadas);
router.get("/api/FA-obtiene-fa-id", API.obtieneFA_id);
router.get("/api/FA-obtiene-elc-id", API.obtieneELC_id);
router.get("/api/obtiene-subcategorias", API.obtieneSubcategorias);
router.get("/api/guardar-datos-pers/", API.guardarDatosPers);

// VISTAS
router.get("/palabras-clave", ...algunos, cartelRespons, vista.palabrasClaveForm);
router.post("/palabras-clave", ...algunos, vista.palabrasClaveGuardar);
router.get("/desambiguar", ...algunos, vista.desambiguarForm);
router.post("/desambiguar", ...algunos, vista.desambiguarGuardar);
router.get("/tipo-producto", ...algunos, autorizadoFA, vista.tipoProd_Form);
router.post("/tipo-producto", ...algunos, vista.tipoProd_Guardar);
router.post("/tipo-producto-fa", ...todosFA, vista.copiarFA_Form);
router.get("/copiar-fa", ...todosFA, vista.copiarFA_Form);
router.post("/copiar-fa", ...todosFA, vista.copiarFA_Guardar);
// Comienzo de "prodYaEnBD"
router.get("/datos-duros", ...todos, vista.datosDurosForm);
router.post("/datos-duros", ...todos, multer.single("avatar_url"), vista.datosDurosGuardar);
router.get("/datos-personalizados", ...todos, vista.datosPersForm);
router.post("/datos-personalizados", ...todos, vista.datosPersGuardar);
router.get("/confirma", ...todos, vista.confirmaForm);
router.post("/confirma", ...todos, vista.confirmaGuardar);
// Fin de "prodYaEnBD"
router.get("/terminaste", ...algunos, vista.terminasteForm);
// Miscelaneas
router.get("/responsabilidad", soloUsuarios, vista.responsabilidad);

// Fin
module.exports = router;
