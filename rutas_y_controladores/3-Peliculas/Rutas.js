// Requires
let express = require('express');
let router = express.Router();
let agregarAPI = require("./1-Agregar-API");
let agregarEJS = require("./1-Agregar-EJS");
let RUD = require("./2-RUD");
let opciones = require("./3-Opciones");

// Middlewares de Validaciones
let soloUsuarios = require("../../middlewares/usuarios/soloUsuarios");
let validarPalabrasClave = require("../../middlewares/validarFilmForms/1-PalabrasClave");
let validarDatosDuros = require("../../middlewares/validarFilmForms/2-DatosDuros");
let validarDatosPers = require("../../middlewares/validarFilmForms/3-DatosPersonalizados");
let validarProdEnBD = require("../../middlewares/varios/productoYaEnBD");

// Otros middlewares
let uploadFile = require("../../middlewares/varios/multer");

// ** Rutas ************************************
// Controladores de APIs
router.get("/agregar/api/contador/", agregarAPI.contador);
router.get("/agregar/api/averiguar-producto-ya-en-bd-fa/", agregarAPI.averiguarProductoYaEnBD_FA);
router.get("/agregar/api/procesarcontenidofa/", agregarAPI.procesarContenidoFA);

// Controladores de EJS - 0. Responsabilidad
router.get("/agregar/responsabilidad", soloUsuarios, agregarEJS.responsabilidad);

// Controladores de EJS - 1. Palabras Clave
router.get("/agregar/palabras_clave", soloUsuarios, agregarEJS.palabrasClaveForm);
router.post('/agregar/palabras_clave', soloUsuarios, validarPalabrasClave, agregarEJS.palabrasClaveGuardar);

// Controladores de EJS - 2. Desambiguar, Copiar FA, Ya en nuestra BD
router.get("/agregar/desambiguar", soloUsuarios, agregarEJS.desambiguarTMDB_Form);
router.post("/agregar/desambiguar", soloUsuarios, agregarEJS.desambiguarTMDB_Guardar);
// *** verificar que el usuario esté habilitado
router.get("/agregar/copiarfa", soloUsuarios, agregarEJS.copiarFA_Form);
router.post("/agregar/copiarfa", soloUsuarios, agregarEJS.copiarFA_Guardar);
router.get("/agregar/ya-en-bd", soloUsuarios, agregarEJS.yaEnBD_Form);
//router.post("/agregar/ya-en-bd", soloUsuarios, agregarEJS.yaEnBD_Form);

// Controladores de EJS - 3. Datos Duros
router.get("/agregar/datos_duros", soloUsuarios, validarProdEnBD, agregarEJS.datosDuros_Form);
router.post("/agregar/datos_duros", soloUsuarios, validarDatosDuros, agregarEJS.datosDuros_Guardar);

// Controladores de EJS - 4. Datos Personalizados
router.get("/agregar/datos_personalizados", soloUsuarios, validarProdEnBD, agregarEJS.DatosPersForm);
router.post("/agregar/datos_personalizados", soloUsuarios, validarDatosPers, agregarEJS.DatosPersGuardar);

// Controladores RUD (método GET)
router.get("/detalle/informacion/:id", soloUsuarios, RUD.detalle);
router.get("/detalle/editar/:id", soloUsuarios, RUD.detalle);
router.get("/detalle/eliminar/:id", soloUsuarios, RUD.detalle);
router.get('/detalle/calificala/:id', soloUsuarios, RUD.detalle);
router.get('/detalle/:id/:id', RUD.detalle);

// Controladores UD (método POST)
router.post("/detalle/editar/:id", soloUsuarios, RUD.editarGuardar);
router.post("/detalle/eliminar/:id", soloUsuarios, RUD.bajaGuardar);

// Controladores de Opciones
router.get('/:id/:id', opciones.tipo);
router.post('/:id/:id', soloUsuarios, opciones.filtros);
router.get('/:id', opciones.opcion);
router.get('/', opciones.home);

// Fin
module.exports = router;
