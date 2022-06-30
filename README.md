main HTML file for face AR - example/face-tracking/three-facemesh.html

Main JS File - src/face-target/three.js

Second JS File (To Call the Three and Mediapipe) - dist-dev/controller.js

in controller.js

to add facemesh for example a 2d image for makeup uncomment the lines 17,18,23 and in line 17 give the path of the texture.
But for any texture make sure you use the same UV Map settings as in the image texture that is mentioned,

Also comment out line 26-30 to stop loading model.

To add model in the the experience no need to uncomment the facemesh things in controller.js

At the same time in three.js the function addmodel is responsible for adding the model based on the parameter passed in URl and if you want to fetch models from the API then you can uncomment lines 83-108 and comment out lines 74-81.

Also point on the face at which you want to place model lets say nose, ear, eye etc etc you need to specify the landmark point which you can check on line number 11 in controller.js where you can mention landmark point.

To check which landmark to chose refer this image - "./assets/canonical_face_model_uv_visualization.png"