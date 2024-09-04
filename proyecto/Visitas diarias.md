Visitas diarias
- Códigos de visita_id
	- Con usuario: U0...0 (U + 10 dígitos, donde va el id)
	- Sin usuario: V0...0 (V + 10 dígitos, donde va un n° al azar)

- La visita está siempre vigente, para actualizar 'loginDelDia' con el cambio de fecha

- Se obtiene,
	- de session/cookie
	- si no existe, crea una, con el campo 'recienCreado'

- En el middleware,
	- Se procesa cuando alguna de estas:
		- la fecha de alguno es anterior a hoy
		- la visita tiene el campo 'recienCreado'
	- Si la visita.id difiere de visita_id,
		- En 'loginDelDia'  con fecha: hoy, actualiza 'visita_id' con 'visita.id' (await)
		- En visita, actualiza visita.id con visita_id

- En procesos, se busca por fecha y visita_id

- En 'loginsDelDia', las personas se cuentan una sola vez por día,
	- Lo más completa posible: con usuario_id
	- Lo más actualizada posible: con visita_id

- En loginsAcum,
	- Se cuenta en usuario o visita, en forma excluyente
