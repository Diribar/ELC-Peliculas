"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./ControladorAPI");
const vista = require("./ControladorVista");

//************************ Middlewares ******************************
const soloAutInput = require("../../middlewares/usuarios/solo2-aut-input");
const aptoDE = require("../../middlewares/captura/aptoDE");
const prodYaEnBD = require("../../middlewares/producto/productoYaEnBD");
const todos = [soloAutInput, aptoDE, prodYaEnBD];
const autorizadoFA = require("../../middlewares/usuarios/autorizadoFA");
const todosFA = [soloAutInput, aptoDE, autorizadoFA];
const entidad = require("../../middlewares/producto/entidadNombre");
const id = require("../../middlewares/producto/entidadID");
const multer = require("../../middlewares/varios/multer");

//************************ Rutas ****************************
// APIs
// Validar
router.get("/api/validar/palabras-clave", API.validarPalabrasClave);
router.get("/api/validar/copiar-fa", API.validarCopiarFA);
router.get("/api/validar/datos-duros", API.validarDatosDuros);
router.get("/api/validar/datos-personalizados", API.validarDatosPers);
// Varias
router.get("/api/PC-cant-prod", API.cantProductos);
router.get("/api/DS-averiguar-coleccion", API.averiguarColeccion);
router.get("/api/TP-averiguar-colecciones", API.averiguarColecciones);
router.get("/api/TP-averiguar-cant-temporadas", API.averiguarCantTemporadas);
router.get("/api/FA-obtener-fa-id", API.obtenerFA_id);
router.get("/api/FA-obtener-elc-id", API.obtenerELC_id);
router.get("/api/obtener-subcategorias", API.obtenerSubcategorias);
router.get("/api/guardar-datos-pers/", API.guardarDatosPers);

// VISTAS
router.get("/palabras-clave", soloAutInput, aptoDE, vista.palabrasClaveForm);
router.post("/palabras-clave", soloAutInput, aptoDE, vista.palabrasClaveGuardar);
router.get("/desambiguar", soloAutInput, aptoDE, vista.desambiguarForm);
router.post("/desambiguar", soloAutInput, aptoDE, vista.desambiguarGuardar);
router.get("/tipo-producto", soloAutInput, aptoDE, autorizadoFA, vista.tipoProd_Form);
router.post("/tipo-producto-dd", soloAutInput, aptoDE, vista.tipoProd_Guardar);
router.post("/tipo-producto-fa", ...todosFA, vista.copiarFA_Form);
router.get("/copiar-fa", ...todosFA, vista.copiarFA_Form);
router.post("/copiar-fa", ...todosFA, vista.copiarFA_Guardar);
// Comienzo de "prodYaEnBD"
router.get("/datos-duros", ...todos, vista.datosDurosForm);
router.post("/datos-duros", ...todos, multer.single("avatar"), vista.datosDurosGuardar);
router.get("/datos-personalizados", ...todos, vista.datosPersForm);
router.post("/datos-personalizados", ...todos, vista.datosPersGuardar);
router.get("/confirma", ...todos, vista.confirmaForm);
router.post("/confirma", ...todos, vista.confirmaGuardar);
// Fin de "prodYaEnBD"
router.get("/terminaste", soloAutInput, entidad, id, vista.terminasteForm);

// Fin
module.exports = router;
