# Workflow de compilación
## Comandos
Ejecuta "npm run" para ver qué puedes hacer
# Workflow de implementación

# BBDD
## FireStore
 $ significa controlado por el sistema
 !1 Significa que sólo se puede asignar una vez
 &/# Significa que puede no estar
 ? Significa que no tengo nada claro cómo va a ser

### Profiles
	Publico editable
		- bio (Estado/descripción)
		- pbMail (corre electrónico que quieras compartir, correo público)
	Publico restringido
		- upDate (Fecha alta)
		- cert (es entidad verificada)
	Privado editable
		- subs (Posts a los que está suscrito)
	Privado restringido
		- id
		- reportCount
### Posts
	- id $
	- author !1
	- type (Tipo: Lost|Found|Give|Take) !1
	- upDate (Fecha creación) $
	- modDate (Fecha última modificación) $
	- isUp (Sigue siendo revevante?)
	- img (imagen en la miniatura y cabecera)
	- lang (idioma)
	- title (Título)
	- body (Cuerpo)
	- addr (dirección; coordenadas, dirección clásica y geohash)
	- aniIds (Animales involucrados)
### Reports
	- id $
	- emmiter $
	- reportedUser !1
	- reason &/# !1
	- message &/# !1
	- post &/# !1
### Animals
	- id $
	- name
	- duplicated (Cuando se registra un animal ya registrado anteriormente este campo servirá para vincular las dos entradas)
	- species (especie)
	- subspecies (raza)
	- imgs (enlaces a las imágenes del animal)
	- status (wantsOwner|adopted|lost|feral|deceased)
## Firebase realtime database
Visit https://firebase.google.com/docs/database/security to learn more about security rules.
### Chats
	- id $ (Es posible que sea rentable plantear un sitema de Id para )
	- modDate $
	- lastData $ (útlimos mensajes escritos)
	- users $
	- msgCount $
### Messages
	- id $
	- upDate $
	- users $
	- chatId $
	- body $
## Google Cloud Storage
Aquí se deberán guardar los archivos multimedia.

# Sistema de componentes
La web es una aplicación de una página.

Para intentar optimizar el rendimiento al máximo se ha hecho todo en vanilla Javascript.

A continuación se explicará el sistema de tres niveles.

## Index/MasterPage (0)
Aporta la parte visual constante.
## Vistas (1)
Aporta las posibles tipos de páginas que pueda mostrar, define su distribución interna y qué componentes contiene la página.
## Componentes (2)
Elementos finales que se pueden ver en la página

# End