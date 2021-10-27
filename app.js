// ********************** Requires ********************************
require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override"); // Para usar PUT y DELETE
const session = require("express-session"); // Para usar la propiedad "session"
const cookies = require("cookie-parser"); // Para usar cookies

// ************** Middlewares de Aplicación ***********************
app.use(express.static(path.resolve(__dirname, "./public"))); // Para acceder a los archivos de la carpeta public
app.use(express.urlencoded({ extended: false })); // Para usar archivos en los formularios (Multer)
app.use(methodOverride("_method")); // Para usar PUT y DELETE
app.use(express.json()); // ¿Para usar JSON con la lectura y guardado de archivos?
app.use(session({ secret: "keyboard cat", resave: false, saveUninitialized: false })); // Para usar la propiedad "sesión"
app.use(cookies());
const usuario = require("./middlewares/usuarios/loginCookie");
app.use(usuario); // Para recuperar usuario a partir de cookie
const userLogs = require("./middlewares/varios/userLogs");
app.use(userLogs); // Para registrar los URL de las páginas navegadas

// *********** Para conectarse con el servidor ********************
app.listen(80, () => console.log("Servidor funcionando..."));

// ******** Terminación de los archivos de vista ******************
app.set("view engine", "ejs");

// ******** Todas las carpetas donde se almacenan vistas **********
app.set("views", [
	path.resolve(__dirname, "./views"),
	path.resolve(__dirname, "./views/0-Partials"),
	path.resolve(__dirname, "./views/0-Partials/menusHeader"),
	path.resolve(__dirname, "./views/1-Institucional"),
	path.resolve(__dirname, "./views/2-Usuarios"),
	path.resolve(__dirname, "./views/3-AgregarProductos"),
	path.resolve(__dirname, "./views/3-AgregarProductos/Includes"),
	path.resolve(__dirname, "./views/4-ProductosRUD"),
	path.resolve(__dirname, "./views/5-ElegirOpciones"),
]);

// ************************* Rutas ********************************
let rutaECC = require("./rutas_y_controladores/1-Institucional/Rutas");
let rutaUsuarios = require("./rutas_y_controladores/2-Usuarios/Rutas");
let rutaAgregarProducto = require("./rutas_y_controladores/3-ProductosAgregar/Rutas");
let rutaRudOpciones = require("./rutas_y_controladores/8-Productos/RutasRudOpciones");
//let rutaMiscelaneas = require("./rutas_y_controladores/9-Miscelaneas/Rutas");
app.use("/usuarios", rutaUsuarios);
app.use("/agregar/productos", rutaAgregarProducto);
app.use("/productos", rutaRudOpciones);
//app.use("/:id", rutaMiscelaneas);
app.use("/", rutaECC);

// ************************ Errores *******************************
//app.use((req,res) => {res.status(404).render('not found')})
