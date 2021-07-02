// Requires
const express = require('express');
const router = express.Router();
const agregar = require("./Ambas2-Agregar");
const RUD = require("./Ambas3-RUD");
const opciones = require("./Ambas1-Opciones");

// Middlewares de Validaciones
const soloUsuarios = require("../../middlewares/usuarios/soloUsuarios");
const validar1 = require("../../middlewares/validarFilmForms/1-IngresarPalabrasClave");
const validar2 = require("../../middlewares/validarFilmForms/2-DatosDuros");
const validar3 = require("../../middlewares/validarFilmForms/3-DatosPersonalizados");

// Controladores de Crear
router.get("/agregar/responsabilidad", soloUsuarios, agregar.responsabilidad);
router.get("/agregar/palabras_clave", soloUsuarios, agregar.palabrasClaveForm);
router.get("/agregar/api/contador/", agregar.contador);
router.post('/agregar/palabras_clave', soloUsuarios, validar1, agregar.palabrasClaveGuardar);

router.get("/agregar/desambiguar1", soloUsuarios, agregar.desambiguarTMDB_Form);
router.get("/agregar/desambiguar1", soloUsuarios, agregar.desambiguarTMDB_Form);

// 3. Datos Duros
router.get("/agregar2", soloUsuarios, agregar.agregar2Form);
router.post("/agregar2", soloUsuarios, validar2, agregar.agregar2Guardar);

// 4. Datos Personalizados
router.get("/agregar3", soloUsuarios, agregar.agregar3Form);
router.post('/agregar3', soloUsuarios, validar3, agregar.agregar3Guardar);

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
