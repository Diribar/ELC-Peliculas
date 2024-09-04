Visitas diarias
- Códigos de visita_id
	- Con usuario: U0...0 (U + 10 dígitos, donde va el id)
	- Sin usuario: V0...0 (V + 10 dígitos, donde va un n° al azar)

- La visita está siempre vigente, para actualizar 'loginDelDia' con el cambio de fecha

- Se obtiene,
	- de session/cookie
	- si no existe, crea una

- En el middleware, si la visita.id difiere del visita_id,
	- Elimina 'loginDelDia' con visita.id y fecha: hoy
	- Actualiza visita.id con visita_id

- En 'loginsDelDia', las personas se cuentan una sola vez por día,
	- Lo más completa posible: con usuario_id
	- Lo más actualizada posible: con visita_id

- En loginsAcum,
	- Se cuenta en usuario o visita, en forma excluyente
