// ************ Requires ************
const express = require('express'); const app = express();
const methodOverride = require('method-override'); // Para usar PUT y DELETE
const session = require('express-session'); // Para usar la propiedad "sesión"
const cookies = require('cookie-parser'); // Para usar cookies

// **** Middlewares de Aplicación ****
app.use(express.static(path.resolve(__dirname, "./public"))); // Para acceder a los archivos de la carpeta public
app.use(express.urlencoded({ extended: false })); // Para usar archivos en los formularios
app.use(methodOverride('_method')); // Para usar PUT y DELETE
app.use(express.json()); // ¿Para usar JSON con la lectura y guardado de archivos?
app.use(session({secret:"", resave:false, saveUninitialized: false})); // Para usar la propiedad "sesión"
const logueado = require('./middleware/us_logueado_global'); app.use(logueado); // Para ocultar íconos según login (después de "session")
app.use(cookies());

// *** Para conectarse con el servidor ***
app.listen(3001, () => console.log('Servidor funcionando en puerto 3001...'))

// * Terminación de los archivos de vista *
app.set('view engine', 'ejs'); 

// Todas las carpetas donde se almacenan vistas
app.set('views', [
    path.resolve(__dirname, './views/00-Base'), 
    path.resolve(__dirname, './views/10-ECC'), 
    path.resolve(__dirname, './views/11-Peliculas')
]);

// *************** Rutas ***************
const rutaPelis = require('./controladores y rutas/rutas/usuarios.js');
const rutaPelis = require('./controladores y rutas/rutas/peliculas');
const rutaECC = require('./controladores y rutas/rutas/ecc');
app.use('/', rutaUsuarios)  //************ Login y Registro
app.use('/peliculas', rutaPelis) //** Películas
app.use('/', rutaECC)  //************ Home, Acerca de Nosotros, Contáctanos

// ************** Errores ***************
app.use((req,res) => {res.status(404).render('not found')})
