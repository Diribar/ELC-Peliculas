const db = require("../../base_de_datos/modelos");
const entidad = db.usuarios;
const bcryptjs = require("bcryptjs");

module.exports = {
	obtenerPorId: (id) => {
		return entidad.findByPk(id, {
			include: [
				"rol_usuario",
				"sexo",
				"status_registro_usuario",
				"pais",
				"estado_eclesial",
			],
		});
	},
	obtenerPorMail: (email) => {
		return entidad.findOne({
			where: { email: email },
			include: [
				"rol_usuario",
				"sexo",
				"status_registro_usuario",
				"pais",
				"estado_eclesial",
			],
		});
	},
	upgradeStatusUsuario: (id, st) => {
		return entidad.update({ status_registro_usuario_id: st }, { where: { id: id } });
	},
	altaMail: (emailDeUsuario) => {
		//let contrasena = Math.round(Math.random()*Math.pow(10,10))+""
		let contrasena = "1234567890";
		return entidad.create({
			email: emailDeUsuario,
			contrasena: bcryptjs.hashSync(contrasena, 10),
		});
	},
	datosPerennes: (id, datos) => {
		return entidad.update(
			{
				nombre: datos.nombre,
				apellido: datos.apellido,
				sexo_id: datos.sexo,
				fecha_nacimiento: datos.fechaNacimiento,
			},
			{ where: { id: id } }
		);
	},
	datosEditables: (id, datos) => {
		return entidad.update(
			{
				apodo: datos.apodo,
				pais_id: datos.pais,
				estado_eclesial_id: datos.estado_eclesial,
				avatar: datos.avatar,
			},
			{ where: { id: id } }
		);
	},
	EmailYaExistente: async (email, id) => {
		return entidad.count({
			where: {
				id: { [Op.ne]: id },
				email: email,
			},
		});
	},
	///////////////////////////////////////////////////////////////////////
	editar: (id, infoUsuario, fileName) => {
		return entidad.update(
			{
				nombre: infoUsuario.nombre,
				apellido: infoUsuario.apellido,
				email: infoUsuario.email,
				contrasena: bcryptjs.hashSync(infoUsuario.contrasena, 10),
				avatar: fileName,
			},
			{ where: { id: id } }
		);
	},
	eliminar: (id, usuario) => {
		return entidad.update(
			{
				borrado: true,
				actualizado_por: usuario,
			},
			{ where: { id: id } }
		);
	},
	obtenerAvatar: async (id) => {
		let usuario = await entidad.findByPk(id);
		return usuario.avatar;
	},
};
