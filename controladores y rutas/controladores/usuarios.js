// ************ Requires ************
const fs = require('fs');
const path = require('path')
const {validationResult} = require('express-validator');
const Registro = require('../../modelos/usuarios');
const bcryptjs = require('bcryptjs')

// ************ Funciones ************
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};
function guardar(n, contenido) {fs.writeFileSync(n, JSON.stringify(contenido, null, 2))};

// ************ Variables ************
const ruta_nombre = path.join(__dirname, '../../bases_de_datos/usuarios.json');

// *********** Controlador ***********
module.exports = {

	altaForm: (req, res) => {
		return res.render('10-Login-y-Usuarios', {
			link: "/usuarios/registro",
			titulo: "Registro"
		});
	},
	
	altaGuardar: (req, res) => {
		return res.send("estoy acá!")
		// Verificar si hay errores en el data entry
		let resultado = validationResult(req);
		if (resultado.errors.length > 0) {
			return res.render('formAlta', {
				Errores: resultado.mapped(),
				Data_Entry: req.body
			});
		};
		// Verificar si el mail ya está registrado
		let registro_en_BD = Registro.encontrar_por_campo("email", req.body.email);
		if (registro_en_BD) {
			return res.render('formAlta', {
				Errores:{email:{msg: "Este mail ya está registrado"}},
				Data_Entry: req.body
			});
		};
		// Datos del nuevo registro
		const registro = {
			...req.body, 
			contrasena: bcryptjs.hashSync(req.body.password,10),
			imagen: req.file.filename,
		};
		// crear el nuevo usuario
		let registro_creado = Registro.alta_guardar(registro);
		
		res.redirect("/home", {registro_creado});
	},

	altaForm2: (req,res) => {

	},

	altaGuardar2: (req,res) => {

	},

	detalle: (req, res) => {
		let BD = leer(ruta_nombre);		
		let registro = BD.find(n => n.id == req.params.id);
		res.render('detalle', {registro});
	},

	editarForm: (req, res) => {
		let BD = leer(ruta_nombre);		
		let registro = BD.find(n => n.id == req.params.id);
		res.render('editar', {registro});
	},

	editarGuardar: (req, res) => {
		// Obtener el contenido actualizado del registro
		let BD = leer(ruta_nombre);		
		let registro = BD.find(n => n.id == req.params.id);
		const reg_actual = {
			...registro,
			...req.body,
		};
		// Eliminar imagen anterior
		if (req.file) {
			reg_actual.image = req.file.filename;
			if (BD.image) {fs.unlinkSync(path.join(__dirname, RutaDeImagenes, BD.image));}
		}
		// Reemplazar el registro con el contenido actual
		let indice = BD.indexOf(registro)
		BD[indice] = reg_actual
		// Guardar los cambios
		guardar(ruta_nombre, BD);
		res.redirect("/usuario/" + req.params.id);
	},	

	baja: (req, res) => {
		let BD = leer(ruta_nombre);
		let nuevaBD = BD.filter(n => n.id != req.params.id)
		guardar(ruta_nombre, nuevaBD)
		res.redirect("/");
	},

};
