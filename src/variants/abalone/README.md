The approach Abalone is using in its implementation here relies on the use of Higher Order Functions in the state.  
Instead of adding some conditions here and there where appropriate (to adapt for the new variant), you choose to override any specific function you would like in the "configure" step of the initialization of chessground.

Ideally, the code should then be split between

- variant specific code (in the appropriate variant folder).
- generic code (maybe in a "core" folder, but it's currently just in "src")

In case we want to implement Hex here later on, we could create this "core" folder (or just stay in "src"), and start having some generic code inside.  
If there was some code related to hexagons in general that can be shared between Hex and Abalone, we could extract it from here and add it to the src/core/hexagons folder.
