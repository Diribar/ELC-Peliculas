// ************ Requires ************
const fs = require('fs');
const path = require('path')

// ************ Funciones ************
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};
function GuardarArchivo(RutaNombre, Contenido) {fs.writeFileSync(RutaNombre, JSON.stringify(Contenido, null, 2))};


const ruta_nombre = path.join(__dirname, '../bases_de_datos/tablas/usuarios.json');

// ***** Soporte del Controlador *****
module.exports = {
	archivo: ruta_nombre,

	leer_archivo: leer(ruta_nombre),

	encontrar_todos: function () {return this.leer_archivo()},

	generar_id: function () {
		let todos_los_usuarios = this.encontrar_todos();
		let ultimo_usuario = todos_los_usuarios.pop();
		if (ultimo_usuario) {return ultimo_usuario.id + 1;} else {return 1};
	},

	encontrar_por_ID: function (id) {
		let todos_los_usuarios = this.encontrar_todos();
		let usuario_encontrado = todos_los_usuarios.find(n => n.id === id);
		return usuario_encontrado;
	},

	encontrar_por_campo: function (campo, texto) {
		let todos_los_usuarios = this.encontrar_todos();
		let usuario_encontrado = todos_los_usuarios.find(n => n[campo] == texto);
		return usuario_encontrado;
	},

	alta_guardar: function (datos_usuario) {
		let todos_los_usuarios = this.encontrar_todos();
		let nuevo_usuario = {
			id: this.generateId(),
			...datos_usuario,
		}
		todos_los_usuarios.push(nuevo_usuario);
		GuardarArchivo(ruta_nombre, todos_los_usuarios);
		return newUser;
	},

	baja: function (id) {
		let todos_los_usuarios = this.encontrar_todos();
		let finalUsers = todos_los_usuarios.filter(oneUser => oneUser.id !== id);
		fs.writeFileSync(this.fileName, JSON.stringify(finalUsers, null, ' '));
		return true;
	}
}