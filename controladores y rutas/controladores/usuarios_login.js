// ************ Requires ************
const fs = require('fs');
const path = require('path')
const {validationResult} = require('express-validator');
const Registro = require('../modelos/Registro');

// ************ Funciones ************
function LeerArchivo(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};
function GuardarArchivo(RutaNombre, Contenido) {
    fs.writeFileSync(RutaNombre, JSON.stringify(Contenido, null, 2))};

// ************ Variables ************
const Ruta_y_Nombre_de_Archivo = path.join(__dirname, '../../bases_de_datos/usuarios.json');

// *********** Controlador ***********
module.exports = {
	login_form: (req,res) => {
		return res.render("form_Login");
	},
	login_guardar: (req,res) => {
		// Verifica si el mail es correcto
		let usuarioLogin = CRUD.encontrar_por_campo('email', req.body.email);
		if (usuarioLogin) {
			// Verifica si la contraseña es correcta
			let loginOK = bcryptjs.compareSync(req.body.contrasena, usuarioLogin.contrasena)
			if (loginOK) {
				// Ejecuta acciones si el login es correcto
				delete usuarioLogin.contrasena
				req.session.usuarioLogueado = usuarioLogin
				// Graba una cookie si está tildado 'recordame'
				if (req.body.remember) {
					res.cookie("email", req.body.email, {maxAge: 1000*60*2})
				}
				return res.redirect("/usuario/perfil")
			}
			// Ejecuta acciones si la contraseña es incorrecta
			return res.render("form_Login", {
				Errores: {email: {msg: "Credenciales inválidas"}}
			})
		}
		// Ejecuta acciones si el mail es correcto
		res.render("form_Login", {
			Errores: {email: {msg: "Credenciales inválidas."}}
		})
	},
	logout: (req,res) => {
		res.cleanCookie("email");
		req.session.destroy();
		return res.redirect("/");
	},
};
