// VARIABLES GLOBALES -------------------------------------------------
global.unDia = 24 * 60 * 60 * 1000; // Para usar la variable en todo el proyecto
global.unaHora = 60 * 60 * 1000; // Para usar la variable en todo el proyecto
global.meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// REQUIRES Y MIDDLEWARES DE APLICACIÓN ------------------------------------------
require("dotenv").config(); // Para usar el archivo '.env'
const path = require("path");
// Para usar propiedades de express
const express = require("express");
const app = express();
app.use(express.static(path.resolve(__dirname, "./public"))); // Para acceder a los archivos de la carpeta public
app.use(express.urlencoded({extended: false})); // Para usar archivos en los formularios (Multer)
app.use(express.json()); // ¿Para usar JSON con la lectura y guardado de archivos?
// Para usar PUT y DELETE
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
// Para usar la propiedad "session"
const session = require("express-session");
app.use(session({secret: "keyboard cat", resave: false, saveUninitialized: false}));
// Para usar cookies
const cookies = require("cookie-parser");
app.use(cookies());
// Para estar siempre logueado, si existe el cookie
const usuario = require("./middlewares/usuarios/loginConCookie");
app.use(usuario);
// Para tener el rastro de los últimos url
const userLogs = require("./middlewares/varios/userLogs");
app.use(userLogs);
// Para tener siempre a mano las opciones de status_registro
const status_registro = require("./middlewares/varios/status_registro");
app.use(status_registro);

// Para saber el recorrido del proyecto
// var logger = require('morgan');
// app.use(logger('dev'));

// *********** Para conectarse con el servidor ********************
app.listen(80, () => console.log("Servidor funcionando..."));

// ******** Terminación de los archivos de vista ******************
app.set("view engine", "ejs");

// ******** Todas las carpetas donde se almacenan vistas **********
app.set("views", [
	path.resolve(__dirname, "./vistas"),
	path.resolve(__dirname, "./vistas/0-Estructura"),
	path.resolve(__dirname, "./vistas/0-Estructura/menusHeader"),
	path.resolve(__dirname, "./vistas/0-Compartido"),
	path.resolve(__dirname, "./vistas/1-Usuarios"),
	path.resolve(__dirname, "./vistas/2.0-CRUD"),	
	path.resolve(__dirname, "./vistas/2.1-Prod-Create"),
	path.resolve(__dirname, "./vistas/2.1-Prod-Create/Includes"),
	path.resolve(__dirname, "./vistas/2.2-Prod-RUD"),
	path.resolve(__dirname, "./vistas/2.2-Prod-RUD/Includes"),
	path.resolve(__dirname, "./vistas/2.3-RCLV"),
	path.resolve(__dirname, "./vistas/2.4-Links-CRUD"),
	path.resolve(__dirname, "./vistas/2.4-Links-CRUD/Includes"),
	path.resolve(__dirname, "./vistas/3-Revisar"),
	path.resolve(__dirname, "./vistas/3-Revisar/Includes"),
	path.resolve(__dirname, "./vistas/6-Productos"),
	path.resolve(__dirname, "./vistas/9-Inicio"),
	path.resolve(__dirname, "./vistas/9-Miscelaneas"),
]);

// ************************* Rutas ********************************
const rutaUsuarios = require("./rutas_y_controladores/1-Usuarios/Rutas");
const rutaProd_Agregar = require("./rutas_y_controladores/2-Prod-Agregar/Rutas");
const rutaProd_RUD = require("./rutas_y_controladores/3-Prod-RUD/Rutas");
const rutaProd_RCLV = require("./rutas_y_controladores/4-Prod-RCLV/Rutas");
const rutaRevisar = require("./rutas_y_controladores/5-Revisar/Rutas");
const rutaProductos = require("./rutas_y_controladores/6-Productos/Rutas");
const rutaMiscelaneas = require("./rutas_y_controladores/9-Miscelaneas/Rutas");
app.use("/usuarios", rutaUsuarios);
app.use("/producto_agregar", rutaProd_Agregar);
app.use("/producto_rud/", rutaProd_RUD);
app.use("/rclv", rutaProd_RCLV);
app.use("/revision", rutaRevisar);
app.use("/productos", rutaProductos);
app.use("/", rutaMiscelaneas);

// ************************ Errores *******************************
const variables = require("./funciones/3-Procesos/Variables");
app.use((req, res) => {
	let informacion = {
		mensajes: ["No tenemos esa dirección de url en nuestro sitio"],
		iconos: [variables.vistaAnterior(req.session.urlAnterior), variables.vistaInicio],
	};
	res.status(404).render("Errores", {informacion});
});
