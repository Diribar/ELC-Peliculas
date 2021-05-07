// ********************** Requires ********************************
const express = require('express'); const app = express();
const path = require('path')
const methodOverride = require('method-override'); // Para usar PUT y DELETE
const session = require('express-session'); // Para usar la propiedad "session"
const cookies = require('cookie-parser'); // Para usar cookies

// ************** Middlewares de Aplicación ***********************
app.use(express.static(path.resolve(__dirname, "./public"))); // Para acceder a los archivos de la carpeta public
app.use(express.urlencoded({ extended: false })); // Para usar archivos en los formularios (Multer)
app.use(methodOverride('_method')); // Para usar PUT y DELETE
app.use(express.json()); // ¿Para usar JSON con la lectura y guardado de archivos?
app.use(session({secret: 'keyboard cat', resave: false, saveUninitialized: false})); // Para usar la propiedad "sesión"
app.use(cookies());
const usuario = require('./middlewares/usuarios/loginCookie'); app.use(usuario); // Para ocultar íconos según login (después de "session")
const userLogs = require("./middlewares/varios/userLogs"); app.use(userLogs); // Para registrar los URL de las páginas navegadas

// *********** Para conectarse con el servidor ********************
app.listen(3001, () => console.log('Servidor funcionando en puerto 3001...'))

// ******** Terminación de los archivos de vista ******************
app.set('view engine', 'ejs'); 

// ******** Todas las carpetas donde se almacenan vistas **********
app.set('views', [
    path.resolve(__dirname, './views'),
    path.resolve(__dirname, './views/0-Partials'),
    path.resolve(__dirname, './views/1-Institucional'),
    path.resolve(__dirname, './views/2-Usuarios'),
    path.resolve(__dirname, './views/3-PEL-Opciones'),
    path.resolve(__dirname, './views/3-PEL-CRUD'),
    path.resolve(__dirname, './views/3-PEL-CRUD/Agregar'),
]);

// ************************* Rutas ********************************
let rutaLogin = require('./controladores y rutas/rutas/login');
let rutaUsuarios = require('./controladores y rutas/rutas/usuarios');
let rutaPelis = require('./controladores y rutas/rutas/peliculas');
let rutaECC = require('./controladores y rutas/rutas/institucional');
//let rutaPaises = require('./controladores y rutas/rutas/paisesRuta.js');
//app.use('/paises', rutaPaises)
//let rutaUsuarioPais = require('./controladores y rutas/rutas/usuarioPaisRuta');
//app.use('/UsuarioPais', rutaUsuarioPais)
let rutaColeccionPelicula = require('./backup/pruebasColecciónPelículas/coleccionPelicula1Ruta');
app.use('/coleccionPelicula', rutaColeccionPelicula)
app.use('/login', rutaLogin)        // Login
app.use('/usuarios', rutaUsuarios)  // Usuarios
app.use('/peliculas', rutaPelis)    // Películas
app.use('/', rutaECC)               // Acerca de Nosotros, Contáctanos

// ************************ Errores *******************************
//app.use((req,res) => {res.status(404).render('not found')})
