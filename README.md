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


*Development Guide*

Directories explained

/src folder contains majority of the source code
/dist folder contains the built library
/examples folder contains examples to test out during development
To create a production build
run > npm run build. mindar-XXX.prod.js and `mindar-XXX-aframe.propd.js will be generated for each tracking type.

*For development*

run > npm run watch. This will observe the file changes in src folder and continuously build a mindar-XXX.js and mindar-XXX-aframe inside the dist-dev folder. The examples inside the examples folder is using this development build. You can open this examples in browser to start debug/development.

The examples should run in desktop browser and they are just html files, so it's easy to start development. However, because it requires camera access, so you need a webcam. Also, you need to run the html file with some localhost web server. Simply opening the files won't work.

For example, you can install this chrome plugin to start a local server: https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb?hl=en

You most likely would want to test on mobile device as well. In that case, it's better if you could setup your development environment to be able to share your localhost webserver to your mobile devices. If you have difficulties doing that, perhaps behind a firewall, then you could use something like ngrok (https://ngrok.com/) to tunnel the request. But this is not an ideal solution, because the development build of MindAR is not small (>10Mb), and tunneling with free version of ngrok could be slow.

webgl backend
This library utilize tensorflowjs (https://github.com/tensorflow/tfjs) for webgl backend. Yes, tensorflow is a machine learning library, but we didn't use it for machine learning! :) Tensorflowjs has a very solid webgl engine which allows us to write general purpose GPU application (in this case, our AR application).

The core detection and tracking algorithm is written with custom operations in tensorflowjs. They are like shaders program. It might looks intimidating at first, but it's actually not that difficult to understand.