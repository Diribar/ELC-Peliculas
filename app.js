// *********************** Startup ********************************
require("dotenv").config(); // Para usar el archivo '.env'
const path = require("path");
global.unDia = 24 * 60 * 60 * 1000; // Para usar la variable en todo el proyecto
global.unaHora = 60 * 60 * 1000; // Para usar la variable en todo el proyecto

// ************** Middlewares de Aplicación ***********************
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
// Para usar el middleware de Login mediante Cookie
const usuario = require("./middlewares/usuarios/loginConCookie");
app.use(usuario); 
// Para usar el middleware de userLogs
const userLogs = require("./middlewares/varios/userLogs");
app.use(userLogs);

// Para saber el recorrido del proyecto
// var logger = require('morgan');
// app.use(logger('dev'));

// *********** Para conectarse con el servidor ********************
app.listen(80, () => console.log("Servidor funcionando..."));

// ******** Terminación de los archivos de vista ******************
app.set("view engine", "ejs");

// ******** Todas las carpetas donde se almacenan vistas **********
app.set("views", [
	path.resolve(__dirname, "./views"),
	path.resolve(__dirname, "./views/0-Estructura"),
	path.resolve(__dirname, "./views/0-Estructura/menusHeader"),
	path.resolve(__dirname, "./views/0-Uso-Compartido"),
	path.resolve(__dirname, "./views/1-Usuarios"),
	path.resolve(__dirname, "./views/2-Prod-Agregar"),
	path.resolve(__dirname, "./views/2-Prod-Agregar/Includes"),
	path.resolve(__dirname, "./views/3-Prod-RUD"),
	path.resolve(__dirname, "./views/3-Prod-RUD/Includes"),
	path.resolve(__dirname, "./views/4-RCLV"),
	path.resolve(__dirname, "./views/5-Revisar"),
	path.resolve(__dirname, "./views/5-Revisar/Includes"),
	path.resolve(__dirname, "./views/6-Productos"),
	path.resolve(__dirname, "./views/9-Miscelaneas"),
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
app.use("/producto/agregar", rutaProd_Agregar);
app.use("/rclv", rutaProd_RCLV);
app.use("/producto", rutaProd_RUD);
app.use("/revision", rutaRevisar);
app.use("/productos", rutaProductos);
app.use("/", rutaMiscelaneas);

// ************************ Errores *******************************
app.use((req, res) => {
	let informacion = {
		mensajes: ["No tenemos esa dirección de url en nuestro sitio"],
		iconos: [
			{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"},
			{nombre: "fa-house", link: "/", titulo: "Ir a la vista de inicio"},
		],
	};
	res.status(404).render("Errores", {informacion});
});
