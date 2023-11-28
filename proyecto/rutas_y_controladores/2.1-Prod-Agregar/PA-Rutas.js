"use strict";
//************************* Requires *******************************
const router = express.Router();
const API = require("./PA-ControlAPI");
const vista = require("./PA-ControlVista");

//************************ Middlewares ******************************
// Específicos de usuarios
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/usPenalizaciones");
const usAptoInput = require("../../middlewares/filtrosPorUsuario/usAptoInput");
const circuitoProdAgregar = require("../../middlewares/varios/circuitoProdAgregar");
const usAutorizFA = require("../../middlewares/filtrosPorUsuario/usAutorizFA");
// Específicos de productos
const prodYaEnBD = require("../../middlewares/filtrosPorRegistro/prodYaEnBD");
// Consolidados
const dataEntry = [usAltaTerm, usPenalizaciones, usAptoInput, circuitoProdAgregar];
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
router.get("/api/desambiguar-busca-info-en-BE", API.desambForm.buscaInfoEnBE);
router.get("/api/desambiguar-busca-los-productos", API.desambForm.buscaProds);
router.get("/api/desambiguar-reemplaza-las-peliculas-por-su-coleccion", API.desambForm.reemplPeliPorColec);
router.get("/api/desambiguar-pule-la-informacion", API.desambForm.puleLaInfo);
router.get("/api/desambiguar-obtiene-los-hallazgos-de-origen-IM-y-FA", API.desambForm.obtieneHallazgosDeIMFA);
router.get("/api/desambiguar-combina-los-hallazgos-yaEnBD", API.desambForm.combinaHallazgosYaEnBD);
// Desambiguar - Guardar
router.get("/api/desambiguar-actualiza-datos-originales", API.desambGuardar.actualizaDatosOrig);
router.get("/api/desambiguar-averigua-si-la-info-tiene-errores", API.desambGuardar.averiguaSiHayErrores);

// Varias
router.get("/api/PC-cant-prods", API.cantProductos);
router.get("/api/IM-colecciones", API.averiguaColecciones);
router.get("/api/IM-cantTemps", API.averiguaCantTemps);
router.get("/api/FA-obtiene-fa-id", API.obtieneFA_id);
router.get("/api/FA-obtiene-elc-id", API.obtieneELC_id);
router.get("/api/DA-guarda-datos-adics/", API.guardaDatosAdics);
router.get("/api/convierte-letras-al-castellano/", API.convierteLetrasAlCastellano);

// VISTAS
router.get("/palabras-clave", dataEntry, vista.palabrasClave.form);
router.post("/palabras-clave", dataEntry, vista.palabrasClave.guardar);
router.get("/desambiguar", dataEntry, vista.desambiguar);
// Comienzo de "prodYaEnBD"
router.get("/datos-duros", dataEntryMasYaEnBD, vista.datosDuros.form);
router.post("/datos-duros", dataEntryMasYaEnBD, multer.single("avatar"), vista.datosDuros.guardar);
router.get("/datos-adicionales", dataEntryMasYaEnBD, vista.datosAdics.form);
router.post("/datos-adicionales", dataEntryMasYaEnBD, vista.datosAdics.guardar);
router.get("/confirma", dataEntryMasYaEnBD, vista.confirma.form);
router.post("/confirma", dataEntryMasYaEnBD, vista.confirma.guardar);
// Fin de "prodYaEnBD"
router.get("/terminaste", vista.terminaste);
// Ingreso Manual
router.get("/ingreso-manual", dataEntry, vista.IM.form);
router.post("/ingreso-manual", dataEntry, vista.IM.guardar);
// Ingreso FA
router.get("/ingreso-fa", dataEntryMasFA, vista.copiarFA.form);
router.post("/ingreso-fa", dataEntryMasFA, vista.copiarFA.guardar);

// Fin
module.exports = router;
