# EscapeTheLightrooms

Escape The Lightrooms es un juego de navegador, que trata sobre resolver una serie de puzles y escapar de una habitación. 
Ha sido realizado para la evaluación de la parte práctica de la asignatura, siendo los autores:
- ***Jaime Pérez García***
- ***Francisco Expósito Carmona***

## Motivación
Hemos decidido hacer público este proyecto, tanto para demostrar nuestra experiencia y conocimientos, como para apoyar el Software Libre.

## Cómo jugar
Para jugar, necesitarás un navegador web y, si quieres usar el script de lanzamiento, tener python 3 instalado. Este último no es necesario, pero necesitarás un servidor web alternativo capaz de resolver las referencias y cargar los distintos módulos y scripts.

Una vez tengas los requisitos anteriores, necesitas abrir el index.html. Si vas a utilizar el script de lanzamiento, ejecútalo previo a su uso en el directorio donde se encuentra el index.html. Posteriormente, navega a la url localhost:8000. 

En navegadores como firefox, puede ser necesario habilitar una opción en about:config relacionada con la carga de scripts en paths relativos y la seguridad.

## Detalles del proyecto
Este proyecto se ha realizado en javascript, separando los modelos, escenas y sistemas del juego en sus correspondientes módulos. Los módulos principales son:
- **EscapeTheLightrooms:** contendora de la clase principal, encargada de instanciar las salas. Encargado de realizar la actualización e inicialización.
- **GameState:** contenedor del estado del juego. Es una clase Singleton, utilizada de forma global para simplificar la interacción y acceso a diversos elementos (no es la mejor práctica pero ha permitido simplificar enormemente el desarrollo y tener un producto funcional).
- **Sala:** clase abstracta de la que heredan todas las salas. Permite definir las puertas y las dimensiones.
- **Puzles:** controladores de cada puzle. Se encargan de gestionar los cambios sobre el modelo y la lógica del propio puzle.
- **Sistema de Colisiones:** encargado de las colisiones entre los modelos y el jugador. Define Rects, rectángulos AABB que almacenará en un QuadTree y realizará el test de colisiones con el jugador, según el algoritmo Swept Collision Detection.
- **Sistema de interacción:** encargado de la interacción entre el jugador y los modelos. Utiliza raycast para invocar las interacciones sobre los objetos del mundo.
- **Sistema de cámaras:** permite gestionar múltiples cámaras, definir múltiples controladores, eventos de las teclas, etc.

Es importante la consideración de que este proyecto tiene fines académicos, por lo que ha sido diseñado y elaborado para cumplir ese propósito y demostrar nuestras habilidades.

Por otro lado, la clase QuadTree y QuadTreeContainer han sido desarrolladas por nosotros, como un QuadTree basado en listas enlazadas, con eficiencia O(1) a la hora de eliminar colliders. Mediante este sistema, permitimos el cambio de colliders en tiempo real sin tener que reconstruir el árbol. Cabe destacar que, la clase Rect, emplea rectángulos en los ejes XZ, por lo que puede ser necesaria una adaptación de la clase Rect según las circunstancias.
Además, la implementación concreta, utiliza un sistema de índices globales y locales. No es la mejor implementación pero buscábamos algo eficiente y rápido. Recomendamos que si se utiliza, se modifique y mejore para hacerlo más robusto y encapsulado.

### Recursos de terceros
#### Librerías
Se han utilizado las siguientes librerías:
- [Three JS](https://threejs.org/): encargado del rendering, escenografía, interacción con WebGL.
- [Tween](https://createjs.com/tweenjs): para hacer las animaciones.
- [PointerLockControls](https://threejs.org/docs/#examples/en/controls/PointerLockControls): para el control de usuario utilizando la API experimental de bloqueo de puntero.
- CSG.V2: modificada por nuestro profesor a partir de la versión básica [CSG](https://github.com/looeee/threejs-csg)

#### Texturas
En lo que respecta a las texturas:
- Todas las texturas son propiedad de sus dueños originales, con su debida atribución al mérito de su creación y autoría.
- Todas las texturas tienen licencia libre, siempre y cuando se haga mención a los autores.
- Las texturas de las paredes han sido realizadas por nosotros.

Las referencias a los autores y páginas web utilizadas son las siguientes
- [Freepik](https://www.freepik.es/): las texturas son de los autores “rawpixel”, “pikisuperstar”, “kjpargeter”, “kbza”, “macrovector”, “freepik”.
- [Texture Ninja](https://texture.ninja/)
- Google Images

#### Modelos
El modelo del destornillador pertecene a [Free3D - Destornillador](https://free3d.com/es/modelos-3d/destornillador).

## Licencia de uso
Este software y el código (no perteneciente a las librerías ni recursos) ha sido realizado por nosotros, por lo que nos reservamos todos los derechos de su autoría. Puede ser empleado en cualquier proyecto, siempre y cuando se haga referencia a sus autores y a este repositorio. Sin embargo, no se permite su uso para fines comerciales.
En caso de hacer uso de algún recurso externo, se deben hacer las comprobaciones de licencia y referencias de autoría pertinentes, no haciéndonos nosotros responsables de cualquier uso indebido.
