Datos Personalizados
	- El link a "Agregar Personaje/Hecho" es con req.query para perservar el data entry de DP

Relación con la vida
	- Cuando se recibe un req.query,
		- Grabar los datos de DP en req.session.datosPers/cookies
		- Redirigir a ese mismo link, sin el req.query, para limpiar el URL
	- Validar si el nombre ya existe en la BD

Usuario:
	- Mover el archivo avatar a la carpeta definitiva (línea 231)
		./public/imagenes/2-Usuarios
		./public/imagenes/4-Provisorio
	- Revisar que funcione bien el req.session
