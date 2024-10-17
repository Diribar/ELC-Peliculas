"use strict";
// Variables
const router = express.Router();
const API = require("./PA-ControlAPI");
const vista = require("./PA-ControlVista");

// Middlewares
const m = {
	// Específicos de usuarios
	usAltaTerm: require("../../middlewares/porUsuario/usAltaTerm"),
	usPenalizaciones: require("../../middlewares/porUsuario/usPenalizaciones"),
	usAptoInput: require("../../middlewares/porUsuario/usAptoInput"),
	usAutorizFA: require("../../middlewares/porUsuario/usAutorizFA"),

	// Específicos del registro
	prodAgregar: require("../../middlewares/porRegistro/prodAgregar"),
	prodYaEnBD: require("../../middlewares/porRegistro/prodYaEnBD"),

	// Otros
	multer: require("../../middlewares/varios/multer"),
};

// Middlewares - Consolidados
const dataEntry = [m.usAltaTerm, m.usPenalizaciones, m.usAptoInput, m.prodAgregar];
const dataEntryMasYaEnBD = [...dataEntry, m.prodYaEnBD];
const dataEntryMasFA = [...dataEntry, m.usAutorizFA];

// APIs - Validaciones
router.get("/api/pa-valida-pc", API.validacs.palabrasClave);
router.get("/api/pa-valida-ds", API.validacs.desambiguar);
router.get("/api/pa-valida-dd", API.validacs.datosDuros);
router.get("/api/pa-valida-da", API.validacs.datosAdics);
router.get("/api/pa-valida-fa", API.validacs.copiarFA);

// APIs - Palabras clave
router.get("/api/pa-busca-info-de-session-pc", API.buscaInfoDeSession_pc);

// APIs - Palabras clave y Desambiguar
router.get("/api/pa-busca-los-productos", API.pc_ds.buscaProds);
router.get("/api/pa-reemplaza-las-peliculas-por-su-coleccion", API.pc_ds.reemplPeliPorColec);
router.get("/api/pa-organiza-la-info", API.pc_ds.organizaLaInfo);
router.get("/api/pa-agrega-hallazgos-de-IM-y-FA", API.pc_ds.agregaHallazgosDeIMFA);
router.get("/api/pa-obtiene-el-mensaje", API.pc_ds.obtieneElMensaje);

// APIs - Desambiguar
router.get("/api/pa-busca-info-de-session-ds", API.desamb.buscaInfoDeSession);
router.get("/api/pa-obtiene-mas-info-del-prod", API.desamb.obtieneMasInfoDelProd);

// APIs - Varias
router.get("/api/pa-obtiene-colecciones", API.averiguaColecciones); // im
router.get("/api/pa-obtiene-cant-temps", API.averiguaCantTemps); // im
router.get("/api/pa-obtiene-fa-id", API.obtieneFA_id); // fa
router.get("/api/pa-averigua-si-fa-ya-existe-en-bd", API.averiguaSiYaExisteEnBd); // fa
router.get("/api/pa-guarda-datos-adicionales/", API.guardaDatosAdics); // datos adicionales

// Vistas - Data entry
router.get("/agregar-pc", dataEntry, vista.palabrasClave.form);
router.post("/agregar-pc", dataEntry, vista.palabrasClave.guardar);
router.get("/agregar-ds", dataEntry, vista.desambiguar);

// Vistas - Comienzo de "prodYaEnBD"
router.get("/agregar-dd", dataEntryMasYaEnBD, vista.datosDuros.form);
router.post("/agregar-dd", dataEntryMasYaEnBD, m.multer.single("avatar"), vista.datosDuros.guardar);
router.get("/agregar-da", dataEntryMasYaEnBD, vista.datosAdics.form);
router.post("/agregar-da", dataEntryMasYaEnBD, vista.datosAdics.guardar);
router.get("/agregar-cn", dataEntryMasYaEnBD, vista.confirma.form);
router.post("/agregar-cn", dataEntryMasYaEnBD, vista.confirma.guardar);

// Vistas - Fin de "prodYaEnBD"
router.get("/agregar-tr", vista.terminaste);

// Vistas - Ingreso Manual
router.get("/agregar-im", dataEntry, vista.IM.form);
router.post("/agregar-im", dataEntry, vista.IM.guardar);

// Vistas - Ingreso FA
router.get("/agregar-fa", dataEntryMasFA, vista.FA.form);
router.post("/agregar-fa", dataEntryMasFA, vista.FA.guardar);

// Fin
module.exports = router;
