// Requires
const express = require('express');
const router = express.Router();
const agregar = require("./1-Agregar");
const RUD = require("./2-RUD");
const opciones = require("./3-Opciones");

// Middlewares de Validaciones
const soloUsuarios = require("../../middlewares/usuarios/soloUsuarios");
const soloPropietario = require("../../middlewares/usuarios/soloPropietario");
const validarPalabrasClave = require("../../middlewares/validarFilmForms/1-PalabrasClave");
const validarDatosDuros = require("../../middlewares/validarFilmForms/2-DatosDuros");
const validarDatosPers = require("../../middlewares/validarFilmForms/3-DatosPersonalizados");
const validarProdEnBD = require("../../middlewares/varios/productoYaEnBD");

// Controladores de Crear - APIs
router.get("/agregar/api/contador/", agregar.contador);
router.get("/agregar/api/procesarlinkfa/", agregar.procesarLinkFA);
router.get("/agregar/api/procesarcontenidofa/", agregar.procesarContenidoFA);

// Controladores de Crear - Responsabilidad y Palabras Clave
router.get("/agregar/responsabilidad", soloUsuarios, agregar.responsabilidad);
router.get("/agregar/palabras_clave", soloUsuarios, agregar.palabrasClaveForm);
router.post('/agregar/palabras_clave', soloUsuarios, validarPalabrasClave, agregar.palabrasClaveGuardar);

// Controladores de Crear - Desambiguar y Copiar FA
router.get("/agregar/desambiguar", soloUsuarios, agregar.desambiguarTMDB_Form);
router.post("/agregar/desambiguar", soloUsuarios, agregar.desambiguarTMDB_Guardar);
router.get("/agregar/copiarfa", soloPropietario, agregar.copiarFA_Form);
router.post("/agregar/copiarfa", soloPropietario, agregar.copiarFA_Guardar);

// Controladores de Crear - Ya en nuestra BD
router.get("/agregar/ya-en-bd", soloUsuarios, agregar.yaEnBD_Form);
router.post("/agregar/ya-en-bd", soloUsuarios, agregar.yaEnBD_Form);

// 3. Datos Duros
router.get("/agregar/datos_duros", soloUsuarios, validarProdEnBD, agregar.datosDuros_Form);
router.post("/agregar/datos_duros", soloUsuarios, validarDatosDuros, agregar.datosDuros_Guardar);

// 4. Datos Personalizados
router.get("/agregar/datos_personalizados", soloUsuarios, validarProdEnBD, agregar.DatosPersForm);
router.post("/agregar/datos_personalizados", soloUsuarios, validarDatosPers, agregar.DatosPersGuardar);

// Controladores RUD (método GET)
router.get('/detalle/:id/:id', RUD.detalle);
router.get("/detalle/editar/:id", soloUsuarios, RUD.detalle);
router.get("/detalle/eliminar/:id", soloUsuarios, RUD.detalle);
router.get('/detalle/calificala/:id', soloUsuarios, RUD.detalle);

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
