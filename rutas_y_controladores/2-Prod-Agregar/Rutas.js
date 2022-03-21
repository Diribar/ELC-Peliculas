"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./ControladorAPI");
const vista = require("./ControladorVista");

//************************ Middlewares ******************************
const soloAutInput = require("../../middlewares/usuarios/solo2-aut-input");
const autorizadoFA = require("../../middlewares/usuarios/autorizadoFA");
const prodEnBD = require("../../middlewares/producto/productoYaEnBD");
const entidadId = require("../../middlewares/producto/entidadId");
const multer = require("../../middlewares/varios/multer");

//************************ Rutas ****************************
// Rutas de APIs
// Temas de Palabras Clave
router.get("/api/PC-cant-prod", API.cantProductos);
router.get("/api/validar-palabras-clave", API.validarPalabrasClave);
// Temas de Desambiguar
router.get("/api/DS-averiguar-coleccion", API.averiguarColeccion);
// Temas de Tipo de Producto
router.get("/api/TP-averiguar-colecciones", API.averiguarColecciones);
router.get("/api/TP-averiguar-cant-temporadas", API.averiguarCantTemporadas);
router.get("/api/TP-averiguar-capitulos", API.obtenerCapitulos);
// Temas de Copiar FA
router.get("/api/FA-obtener-fa-id", API.obtenerFA_id);
router.get("/api/FA-obtener-elc-id", API.obtenerELC_id);
router.get("/api/validar-copiar-fa", API.validarCopiarFA);
// Temas de Datos Duros
router.get("/api/validar-datos-duros", API.validarDatosDuros);
// Temas de Datos Personalizados
router.get("/api/obtener-RCLV-subcategoria", API.obtenerDatosSubcategoria);
router.get("/api/validar-datos-pers", API.validarDatosPers);

// Rutas de vistas de "Agregar Productos"
router.get("/palabras-clave", soloAutInput, vista.palabrasClaveForm);
router.post("/palabras-clave", soloAutInput, vista.palabrasClaveGuardar);
router.get("/desambiguar", soloAutInput, vista.desambiguarForm);
router.post("/desambiguar", soloAutInput, vista.desambiguarGuardar);
router.get("/tipo-producto", soloAutInput, autorizadoFA, vista.tipoProd_Form);
router.post("/tipo-producto-dd", soloAutInput, vista.tipoProd_Guardar);
router.post("/tipo-producto-fa", soloAutInput, vista.copiarFA_Form);
router.get("/copiar-fa", soloAutInput, autorizadoFA, vista.copiarFA_Form);
router.post("/copiar-fa", soloAutInput, vista.copiarFA_Guardar);
// Comienzo de "prodEnBD"
router.get("/datos-duros", soloAutInput, prodEnBD, vista.datosDurosForm);
router.post("/datos-duros", soloAutInput, prodEnBD, multer.single("avatar"), vista.datosDurosGuardar);
router.get("/datos-personalizados", soloAutInput, prodEnBD, vista.datosPersForm);
router.post("/datos-personalizados", soloAutInput, prodEnBD, vista.datosPersGuardar);
router.get("/confirma", soloAutInput, prodEnBD, vista.confirmaForm);
router.post("/confirma", soloAutInput, prodEnBD, vista.confirmaGuardar);
// Fin de "prodEnBD"
router.get("/terminaste", soloAutInput, entidadId, vista.terminasteForm);

// Rutas de vistas auxiliares
router.get("/responsabilidad", vista.responsabilidad);

// Fin
module.exports = router;
