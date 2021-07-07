// ********************** Requires ********************************
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
app.listen(3001, () => console.log("Servidor funcionando en puerto 3001..."));

// ******** Terminación de los archivos de vista ******************
app.set("view engine", "ejs");

// ******** Todas las carpetas donde se almacenan vistas **********
app.set("views", [
	path.resolve(__dirname, "./views"),
	path.resolve(__dirname, "./views/0-Partials"),
	path.resolve(__dirname, "./views/1-Institucional"),
	path.resolve(__dirname, "./views/2-Usuarios"),
	path.resolve(__dirname, "./views/3-PEL-COL-Agregar"),
	path.resolve(__dirname, "./views/3-PEL-Opciones"),
	path.resolve(__dirname, "./views/3-PEL-CRUD"),
]);

// ************************* Rutas ********************************
let rutaECC = require("./controladores_y_rutas/1-Institucional/Ruta");
let rutaUsuarios = require("./controladores_y_rutas/2-Usuarios/Usuarios-Ruta");
let rutaLogin = require("./controladores_y_rutas/2-Usuarios/Login-Ruta");
let rutaPeliculas = require("./controladores_y_rutas/3-Peliculas/Rutas");
app.use("/usuarios", rutaUsuarios);
app.use("/login", rutaLogin);
app.use("/peliculas", rutaPeliculas);
app.use("/", rutaECC);

// ************************ Errores *******************************
//app.use((req,res) => {res.status(404).render('not found')})
