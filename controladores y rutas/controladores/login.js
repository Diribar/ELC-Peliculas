// ************ Requires ************
const usuarios = require('../../modelos/usuarios');


// *********** Controlador ***********
module.exports = {

	loginForm: (req,res) => {
		return res.render("0-Usuarios", {
			link: req.originalUrl,
			titulo: "Login"
		});
	},

	loginGuardar: (req,res) => {
		// Verifica si el mail es correcto
		let usuarioLogin = usuarios.encontrar_por_campo('email', req.body.email);
		if (usuarioLogin) {
			// Verifica si la contraseña es correcta
			let loginOK = bcryptjs.compareSync(req.body.contrasena, usuarioLogin.contrasena)
			if (loginOK) {
				// Ejecuta acciones si el login es correcto
				delete usuarioLogin.contrasena
				req.session.usuario = usuarioLogin
				// Graba una cookie si está tildado 'recordame'
				if (req.body.remember) {
					res.cookie("email", req.body.email, {maxAge: 1000*60*2})
				}
				return res.redirect("/usuario/perfil")
			}
			// Ejecuta acciones si la contraseña es incorrecta
			return res.render("8-Login-Form", {
				Errores: {email: {msg: "Credenciales inválidas"}}
			})
		}
		// Ejecuta acciones si el mail es correcto
		res.render("2-Login_form", {
			Errores: {email: {msg: "Credenciales inválidas."}}
		})
	},
	recupContrForm: (req,res) => {
		res.send("Recuperar contraseña")
	},
	recupContrGuardar: (req,res) => {
		res.send("Recuperar contraseña")
	},
	logout: (req,res) => {
		res.cleanCookie("email");
		req.session.destroy();
		return res.redirect("/");
	},
};
