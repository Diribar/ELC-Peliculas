// Requires
const express = require('express');
const router = express.Router();
const agregar = require("./1-Agregar");
const RUD = require("./2-RUD");
const opciones = require("./3-Opciones");

// Middlewares de Validaciones
const soloUsuarios = require("../../middlewares/usuarios/soloUsuarios");
const validarPalabrasClave = require("../../middlewares/validarFilmForms/1-PalabrasClave");
const validarDatosDuros = require("../../middlewares/validarFilmForms/2-DatosDuros");
const validarDatosPers = require("../../middlewares/validarFilmForms/3-DatosPersonalizados");

// Controladores de Crear - Responsabilidad y Palabras Clave
router.get("/agregar/responsabilidad", soloUsuarios, agregar.responsabilidad);
router.get("/agregar/palabras_clave", soloUsuarios, agregar.palabrasClaveForm);
router.post('/agregar/palabras_clave', soloUsuarios, validarPalabrasClave, agregar.palabrasClaveGuardar);
router.get("/agregar/api/contador/", agregar.contador);

// Controladores de Crear - Desambiguar
router.get("/agregar/desambiguar", soloUsuarios, agregar.desambiguarTMDB_Form);
router.post("/agregar/desambiguar", soloUsuarios, agregar.desambiguarTMDB_Guardar);
router.get("/agregar/copiarfa", soloUsuarios, agregar.copiarFA_Form);
router.post("/agregar/copiarfa", soloUsuarios, agregar.copiarFA_Guardar);

// 3. Datos Duros
router.get("/agregar/datos_duros", soloUsuarios, agregar.datosDuros_Form);
router.post("/agregar/datos_duros", soloUsuarios, validarDatosDuros, agregar.datosDuros_Guardar);

// 4. Datos Personalizados
router.get("/agregar/datos_personalizados", soloUsuarios, agregar.DatosPersForm);
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
// router.get('/:id/:id', opciones.tipo);
// router.post('/:id/:id', soloUsuarios, opciones.filtros);
// router.get('/:id', opciones.opcion);
router.get('/', opciones.home);

// Fin
module.exports = router;
