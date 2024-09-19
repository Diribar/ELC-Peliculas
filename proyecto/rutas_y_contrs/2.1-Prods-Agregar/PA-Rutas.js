"use strict";
// Variables
const router = express.Router();
const API = require("./PA-ControlAPI");
const vista = require("./PA-ControlVista");

// Middlewares - Específicos de usuarios
const usAltaTerm = require("../../middlewares/porUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/porUsuario/usPenalizaciones");
const usAptoInput = require("../../middlewares/porUsuario/usAptoInput");
const circuitoProdAgregar = require("../../middlewares/varios/circuitoProdAgregar");
const usAutorizFA = require("../../middlewares/porUsuario/usAutorizFA");

// Middlewares - Específicos del registro
const prodYaEnBD = require("../../middlewares/porRegistro/prodYaEnBD");

// Middlewares - Otros
const multer = require("../../middlewares/varios/multer");

// Middlewares - Consolidados
const dataEntry = [usAltaTerm, usPenalizaciones, usAptoInput, circuitoProdAgregar];
const dataEntryMasYaEnBD = [...dataEntry, prodYaEnBD];
const dataEntryMasFA = [...dataEntry, usAutorizFA];

// APIs - Validar
router.get("/api/valida/palabras-clave", API.validaPalabrasClave);
router.get("/api/valida/datos-duros", API.validaDatosDuros);
router.get("/api/valida/datos-adicionales", API.validaDatosAdics);
router.get("/api/valida/ingreso-fa", API.validaCopiarFA);

// APIs - Desambiguar Form
router.get("/api/desambiguar-busca-info-de-session", API.desambForm.buscaInfoDeSession);
router.get("/api/desambiguar-busca-los-productos", API.desambForm.buscaProds);
router.get("/api/desambiguar-reemplaza-las-peliculas-por-su-coleccion", API.desambForm.reemplPeliPorColec);
router.get("/api/desambiguar-organiza-la-info", API.desambForm.organizaLaInfo);
router.get("/api/desambiguar-agrega-hallazgos-de-IM-y-FA", API.desambForm.agregaHallazgosDeIMFA);
router.get("/api/desambiguar-obtiene-el-mensaje", API.desambForm.obtieneElMensaje);

// APIs - Desambiguar - Guardar
router.get("/api/desambiguar-actualiza-datos-originales", API.desambGuardar.actualizaDatosOrig);
router.get("/api/desambiguar-averigua-si-la-info-tiene-errores", API.desambGuardar.averiguaSiHayErrores);

// APIs - Varias
router.get("/api/PC-obtiene-la-cantidad-de-prods", API.cantProductos);
router.get("/api/obtiene-colecciones", API.averiguaColecciones);
router.get("/api/obtiene-cantTemps", API.averiguaCantTemps);
router.get("/api/FA-obtiene-fa-id", API.obtieneFA_id);
router.get("/api/averigua-si-ya-existe-en-bd", API.averiguaSiYaExisteEnBd);
router.get("/api/DA-guarda-datos-adics/", API.guardaDatosAdics);
router.get("/api/convierte-letras-al-castellano/", API.convierteLetrasAlCastellano);

// Vistas - Data entry
router.get("/palabras-clave", dataEntry, vista.palabrasClave.form);
router.post("/palabras-clave", dataEntry, vista.palabrasClave.guardar);
router.get("/desambiguar", dataEntry, vista.desambiguar);

// Vistas - Comienzo de "prodYaEnBD"
router.get("/datos-duros", dataEntryMasYaEnBD, vista.datosDuros.form);
router.post("/datos-duros", dataEntryMasYaEnBD, multer.single("avatar"), vista.datosDuros.guardar);
router.get("/datos-adicionales", dataEntryMasYaEnBD, vista.datosAdics.form);
router.post("/datos-adicionales", dataEntryMasYaEnBD, vista.datosAdics.guardar);
router.get("/confirma", dataEntryMasYaEnBD, vista.confirma.form);
router.post("/confirma", dataEntryMasYaEnBD, vista.confirma.guardar);

// Vistas - Fin de "prodYaEnBD"
router.get("/terminaste", vista.terminaste);

// Vistas - Ingreso Manual
router.get("/ingreso-manual", dataEntry, vista.IM.form);
router.post("/ingreso-manual", dataEntry, vista.IM.guardar);

// Vistas - Ingreso FA
router.get("/ingreso-fa", dataEntryMasFA, vista.FA.form);
router.post("/ingreso-fa", dataEntryMasFA, vista.FA.guardar);

// Fin
module.exports = router;
