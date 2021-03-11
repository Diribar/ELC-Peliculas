// ********************** Requires ********************************
const express = require('express'); const app = express();
const path = require('path')
const methodOverride = require('method-override'); // Para usar PUT y DELETE
const session = require('express-session'); // Para usar la propiedad "sesión"
const cookies = require('cookie-parser'); // Para usar cookies

// ************** Middlewares de Aplicación ***********************
app.use(express.static(path.resolve(__dirname, "./public"))); // Para acceder a los archivos de la carpeta public
app.use(express.urlencoded({ extended: false })); // Para usar archivos en los formularios
app.use(methodOverride('_method')); // Para usar PUT y DELETE
app.use(express.json()); // ¿Para usar JSON con la lectura y guardado de archivos?
app.use(session({secret: 'keyboard cat', resave: false, saveUninitialized: true})); // Para usar la propiedad "sesión"
const logueado = require('./middlewares/login_global'); app.use(logueado); // Para ocultar íconos según login (después de "session")
app.use(cookies());

// *********** Para conectarse con el servidor ********************
app.listen(3001, () => console.log('Servidor funcionando en puerto 3001...'))

// ******** Terminación de los archivos de vista ******************
app.set('view engine', 'ejs'); 

// ******** Todas las carpetas donde se almacenan vistas **********
app.set('views', [
    path.resolve(__dirname, './views/0-Partials'), 
    path.resolve(__dirname, './views/1-Home'),
    path.resolve(__dirname, './views/2-Usuarios'),
    path.resolve(__dirname, './views/3-1PEL-Opciones'),
    path.resolve(__dirname, './views/3-2PEL-CRUD'),
]);

// ************************* Rutas ********************************
const rutaUsuarios = require('./controladores y rutas/rutas/usuarios.js');
const rutaLogin = require('./controladores y rutas/rutas/login.js');
const rutaPelis = require('./controladores y rutas/rutas/peliculas');
const rutaECC = require('./controladores y rutas/rutas/home');
app.use('/registro', rutaUsuarios)  // Registro
app.use('/login', rutaLogin)        // Login
app.use('/peliculas', rutaPelis)    // Películas
app.use('/', rutaECC)               // Home, Acerca de Nosotros, Contáctanos

// ************************ Errores *******************************
//app.use((req,res) => {res.status(404).render('not found')})
