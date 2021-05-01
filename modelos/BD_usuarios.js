const db = require("../bases_de_datos/modelos");
const entidad = db.usuario;
const bcryptjs = require("bcryptjs");

module.exports = {
    email_existente_en_BD: (email) => {
        return entidad.count({
			where: {email: email}
		}).then(n => n > 0);
    },
	obtener_el_usuario_a_partir_del_email: async (email) => {
        const usuario = await entidad.findOne({
            where: {email: email}
        });
        return usuario;
    },
///////////////////////////////////////////////////////////////////////
	altaMail: (emailDeUsuario) => {
		//let contrasena = Math.round(Math.random()*Math.pow(10,10))+""
		let contrasena = "1234567890"
		return entidad.create({
            email: emailDeUsuario,
            contrasena: bcryptjs.hashSync(contrasena, 10),
        });
	},
	mailValidado: (id) => {
        return entidad.update(
			{status_usuario_id: 2},
    	    {where: { id: id }}
		);
    },
	datosPerennes: (id, datos) => {
        return entidad.update(
			{nombre: datos.nombre, apellido: datos.apellido, sexo: datos.sexo, fecha_nacimiento: datos.fechaNacimiento, status_usuario_id: 3},
			{where: { id: id }}
		);
    },
///////////////////////////////////////////////////////////////////////

	obtenerPorId: (id) => {
        return entidad.findByPk(id, {
            include: [ "roles" ]
        });
    },
    editar: (id, infoUsuario, fileName) => {
        return entidad.update({
            nombre: infoUsuario.nombre,
            apellido: infoUsuario.apellido,
            email: infoUsuario.email,
            contrasena: bcryptjs.hashSync(infoUsuario.contrasena, 10),
            avatar: fileName
        },
        {where: { id: id }});
    },
    eliminar: (id, usuario) => {
        return entidad.update({
            borrado: true,
            actualizado_por: usuario
        },
        {where: { id: id }});
    },
    obtenerAvatar: async (id) => {
        let usuario = await entidad.findByPk(id);
        return usuario.avatar;
    }
};