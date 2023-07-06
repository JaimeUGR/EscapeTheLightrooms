# Escape The Lightrooms
Escape the Lightrooms is a web game, where you have to solve a series of puzzles in order to Escape. It has been made for an university (UGR - ETSIIT) project, in which we had to create a `WebGL` based game.
The authors are:
- ***Jaime Pérez***
- ***Francisco Expósito***

If you like this project and would like to support us, consider donating, as it is really helpful for our learning career and development of new projects.

[![Donate](https://img.shields.io/badge/Donate-PayPal-8A2BE2.svg?logo=paypal)](https://www.paypal.com/donate/?hosted_button_id=5P5ZFSUP2UH22)

## Motivation
We have decided to release this project as an open source game because we are quite proud of the end result. Furthermore, we have created custom geometries, shader based materials, complex animations and many more features which we are proud about.

## How to play
Right now, the game can be played for **FREE** (optionally you can donate) on [Itch.io](https://itch.io/) -> [Escape The Lightrooms]().
We might release a steam version in the future.

### Troubleshooting
This small section showcases common problems that you may encounter in the playable web version.

#### Game doesn't load
If the game is stuck and doesnt load (or there is an error thrown) and you are using `Firefox`, go to "about:config", search "dom.importMaps.enabled" and make sure that this option has the value "true". 

If you are using other browser (Chromium based ones dont have this problem), you must enable dom importMaps. Also, you could switch to another

#### LeftControl doesnt lock the pointer
For security reasons, the pointer lock api has some limitations which may cause behaviours like this. Consider the following:
- Dont lock/unlock the pointer too fast
- While the game is playing, dont switch windows or tabs without pressing either `Escape` or `Left Control`.

If the pointer is not locking with `LeftControl`, click 2 times on the screen with your cursor and then it should work.

## Details
Since Escape The Lightrooms is a web based game, we have mainly used javascript, where we have all the scenes, models and game systems in separate modules, so that they can be reused in any other project (although the game architecture is far from perfect, as this was just a small university project). The main modules are the following:
- **EscapeTheLightrooms:** main game class. It manages the creation of the rooms, game state initialization and the game loop.
- **GameState:** it contains the game state. It is a static class, used globally in order to simplify the interaction and reduce dependency management. As we mentioned before, this approach is not recommended, as Singleton classes can end up in an interdependency hell, where changes can occur anywhere and are hard to track.
- **Room:** abstract class from which all rooms inherit. It handles the creation of the doors, walls and base texturing. 
- **Puzzles:** it contains controllers which manage the different puzzles in the game.
- **Collision System:** this system that manages collisions between 3D models and the player. It uses AABB (customised for our case, as Y collisions are not considered), which are stored in a QuadTree. The collision test algorithm is **Swept Collision Detection**.
- **Interaction System:** this system handles player interaction. Internally, a raycast is used to determine the model that should receive the interaction. After the target model (if there is any) is determined, it performs a range check, which when met, runs specific code that handles the interaction.
- **Camera System:** this system defines a camera controller, which we use to change and create multiple cameras that we can use across the scene. These cameras are controlled and manage by a custom camera controller, which determines and process defined events (like key input, mouse movement).
- **Sound System:** this system manages sounds, by handling load requests for different types of audio. It also controlls the main audio listener.
- **Message System:** this system handles any type of communication directed to the player. For example, it allows us to create temporal messages that are shown on screen. 

Finally, we would like to recall that this project has an academic purpose, which means that its design could be greatly improved by changing the game architecture. However, we are quite proud about the end result, as making an entire game with a few libraries from scratch is quite hard.
Furthermore, we would have preferred using Typescript, but for time and academic requirements we opted for staying with js.

### Custom Libraries (sort of)
Since we needed a `QuadTree` for processing and managing the `Rect` collisions, we looked for third party librarires (for js) which already had a QuadTree type structure. However, we found that they where quite limited and didnt meet our specific requirements (like O(1) erase).

For that reason, we have created a custom implementation, with `QuadTree` and `QuadTreeContainer`. It is a linked list approach, as we had some specific requirements regarding efficiency. With this implementation, we were able to create dynamic colliders, whose size and position can be modified at real time.

We should note that this class is specific for our case, as we only handle XZ collisions, so if you would like to use these classes in your project, you might have to adapt the coordinates and the test check. Also, the implementation can be improved, which we will do in the future, as well as creating a separate repository for a library.

### Third party assets
In this section, we will mention all the third party assets used, including software librarires and other types of assets.

#### Libraries
The following libraries have been used:
- [Three JS](https://threejs.org/): provides all the basic elements for geometry creation, rendering and cameras, scenes, etc.
- [Tween](https://createjs.com/tweenjs): used for animations.
- [PointerLockControls](https://threejs.org/docs/#examples/en/controls/PointerLockControls): used by one of the camera controllers. Simplifies the interaction with the pointer lock API.
- CSG.V2: modified from the original version (it merges all the files). Used for boolean geometry [CSG](https://github.com/looeee/threejs-csg)

#### Textures and Sounds
There arent third party assets in this repository. However, all the assets within the playable bundled game belong to their original authors and have been referenced in the *Credits* section.

## License
All the code (except third party libraries) has been made by us, so we reserve all the rights about its authorship. It can **NOT** be used for commercial projects, only for free / open source / school / non-profit ones, as long as you dont make a direct copy and distribute it as yours, and you make sure to reference us and this repository for its license and usage rights.

Any other type of assets that could be extracted from the bundled game belong to their respective authors. Read the game credits in order to know their license, copyright and any special requirements that may apply.

We are not responsible for any inappropiate usage.
