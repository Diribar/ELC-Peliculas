Visitas diarias
- Códigos de visita_id
	- Con usuario: U0...0 (U + 10 dígitos, donde va el id)
	- Sin usuario: V0...0 (V + 10 dígitos, donde va un n° al azar)

- La visita está siempre vigente, para actualizar 'loginDelDia' con el cambio de fecha

- Se obtiene,
	- de session/cookie
	- si no existe, crea una, con el campo 'recienCreado'

- En el middleware,
	- Si la visita.id difiere de visita_id,
		- En 'loginsDelDia' se actualiza el registro con los valores 'hoy' y 'visita.id', con 'visita_id' (await)
		- En visita, actualiza visita.id con visita_id
		- Actualiza el cookie
	- Se procesa cuando alguna de estas:
		- la fecha de alguno es anterior a hoy
		- la visita tiene el campo 'recienCreado'
	- Actualizaciones cuando se procesa:
		- fecha
		- cookies
		- el contador de logins

- En el contador de logins,
	- Se busca por fecha y visita_id
	- Las personas se cuentan una sola vez por día, con 'usuario_id' si fuera posible

- En loginsAcum,
	- Se cuenta en usuario o visita, en forma excluyente
	- Si es visita, se cuentan los que tiene usuario (comienzan con "U")
