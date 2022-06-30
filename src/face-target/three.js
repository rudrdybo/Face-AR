const THREE = require("three");
const { CSS3DRenderer } = require('three/examples/jsm/renderers/CSS3DRenderer.js');
const { Controller } = require("./controller");
const { UI } = require("../ui/ui");
// const GLTFLoader = require('three/examples/jsm/loaders/GLTFLoader');
const { mod } = require("@tensorflow/tfjs");
//import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js')

class dyboThree {
  constructor({ container, uiLoading = "yes", uiScanning = "yes", uiError = "yes", filterMinCF = null, filterBeta = null }) {

    this.container = container;
    this.ui = new UI({ uiLoading, uiScanning, uiError });

    this.controller = new Controller({
      filterMinCF: filterMinCF,
      filterBeta: filterBeta,
    });

    this.scene = new THREE.Scene();
    this.cssScene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.cssRenderer = new CSS3DRenderer({ antialias: true });
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.camera = new THREE.PerspectiveCamera();
    this.GLTFLOADER = new GLTFLoader();

    this.anchors = [];
    this.faceMeshes = [];

    this.container.appendChild(this.renderer.domElement);
    this.container.appendChild(this.cssRenderer.domElement);

    this.shouldFaceUser = true;

    window.addEventListener('resize', this._resize.bind(this));
  }

  async start() {
    this.ui.showLoading();
    await this._startVideo();
    await this._startAR();
    this.ui.hideLoading();
  }

  stop() {
    const tracks = this.video.srcObject.getTracks();
    tracks.forEach(function (track) {
      track.stop();
    });
    this.video.remove();
    this.controller.stopProcessVideo();
  }

  switchCamera() {
    this.shouldFaceUser = !this.shouldFaceUser;
    this.stop();
    this.start();
  }

  addFaceMesh() {
    console.log("rrrtrt")
    const faceGeometry = this.controller.createThreeFaceGeometry(THREE);
    const faceMesh = new THREE.Mesh(faceGeometry, new THREE.MeshStandardMaterial({ color: 0xffffff }));
    faceMesh.visible = true;
    faceMesh.matrixAutoUpdate = false;
    this.faceMeshes.push(faceMesh);
    return faceMesh;
  }

  addModel(onLoad) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const modelname = urlParams.get('modelname')
    console.log("ModelName = " + modelname);

    let path = "./assets/"
    path = path.concat(modelname);
    path = path.concat(".glb")

    // const queryString = window.location.search;
    // const urlParams = new URLSearchParams(queryString);
    // const sku = urlParams.get('sku')
    // console.log("SKU = " + sku);

    // let path;

    // let request = new XMLHttpRequest();
    //   let URL = "https://gcp.icustomizer.dybo.io/product/api/v1/ar/get-webar-links/"
    //   URL = URL.concat(sku)
    //     request.open("GET",URL);
    //     request.setRequestHeader("x-api-key", "J88zzsM9.q30kus6n44jobT2fhYh9Zoz1JGC7QnFv")
    //     request.send();
    //     request.onload =  () => {
    //         //console.log(request);
    //         if(request.status===200)
    //         {
    //             let json = JSON.parse(request.response)
    //             // console.log(json.data.glb);
    //             path = json.data.glb;
    //             console.log("path ="+path)
    //         }
    //         else{
    //             console.log('error ${request.status} ${request.statusText}')
    //         }
    //     }

    let model = null;
    const loader = this.GLTFLOADER;
    loader.load(path, function (gltf) {
      gltf.scene.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
          node.castShadow = true;
          node.material.side = THREE.DoubleSide;
        }
      });
      model = gltf.scene;
      model.visible = true;
      let scale = 7;
      model.scale.set(scale, scale, scale);
      //faceMesh.add(model);
      onLoad(model)
    });
  }

  addAnchor(landmarkIndex) {
    const group = new THREE.Group();
    group.matrixAutoUpdate = false;
    const anchor = { group, landmarkIndex, css: false };
    this.anchors.push(anchor);
    this.scene.add(group);
    return anchor;
  }

  addCSSAnchor(landmarkIndex) {
    const group = new THREE.Group();
    group.matrixAutoUpdate = false;
    const anchor = { group, landmarkIndex, css: true };
    this.anchors.push(anchor);
    this.cssScene.add(group);
    return anchor;
  }

  _startVideo() {
    return new Promise((resolve, reject) => {
      this.video = document.createElement('video');

      this.video.setAttribute('autoplay', '');
      this.video.setAttribute('muted', '');
      this.video.setAttribute('playsinline', '');
      this.video.style.position = 'absolute'
      this.video.style.top = '0px'
      this.video.style.left = '0px'
      this.video.style.width = "100%";
      this.video.style.height = "100%";
      this.video.style.zIndex = '-2'
      this.container.appendChild(this.video);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.ui.showCompatibility();
        reject();
        return;
      }

      navigator.mediaDevices.getUserMedia({
        audio: false, video: {
          facingMode: (this.shouldFaceUser ? 'face' : 'environment'),
        }
      }).then((stream) => {
        this.video.addEventListener('loadedmetadata', () => {
          this.video.setAttribute('width', this.video.videoWidth);
          this.video.setAttribute('height', this.video.videoHeight);
          resolve();
        });
        this.video.srcObject = stream;
      }).catch((err) => {
        console.log("getUserMedia error", err);
        reject();
      });
    });
  }

  _startAR() {
    return new Promise(async (resolve, reject) => {
      const video = this.video;
      const container = this.container;

      this.controller.onUpdate = ({ hasFace, estimateResult }) => {
        for (let i = 0; i < this.anchors.length; i++) {
          if (this.anchors[i].css) {
            this.anchors[i].group.children.forEach((obj) => {
              obj.element.style.visibility = hasFace ? "visible" : "hidden";
            });
          } else {
            this.anchors[i].group.visible = hasFace;
          }
        }
        for (let i = 0; i < this.faceMeshes.length; i++) {
          this.faceMeshes[i].visible = hasFace;
        }

        if (hasFace) {
          const { metricLandmarks, faceMatrix, faceScale } = estimateResult;
          for (let i = 0; i < this.anchors.length; i++) {
            const landmarkIndex = this.anchors[i].landmarkIndex;
            const landmarkMatrix = this.controller.getLandmarkMatrix(landmarkIndex);

            if (this.anchors[i].css) {
              const cssScale = 0.001;
              const scaledElements = [
                cssScale * landmarkMatrix[0], cssScale * landmarkMatrix[1], landmarkMatrix[2], landmarkMatrix[3],
                cssScale * landmarkMatrix[4], cssScale * landmarkMatrix[5], landmarkMatrix[6], landmarkMatrix[7],
                cssScale * landmarkMatrix[8], cssScale * landmarkMatrix[9], landmarkMatrix[10], landmarkMatrix[11],
                cssScale * landmarkMatrix[12], cssScale * landmarkMatrix[13], landmarkMatrix[14], landmarkMatrix[15]
              ]
              this.anchors[i].group.matrix.set(...scaledElements);
            } else {
              this.anchors[i].group.matrix.set(...landmarkMatrix);
            }
          }
          for (let i = 0; i < this.faceMeshes.length; i++) {
            this.faceMeshes[i].matrix.set(...faceMatrix);
          }
        }
      }
      this._resize();
      await this.controller.setup(video);

      const { fov, aspect, near, far } = this.controller.getCameraParams();
      this.camera.fov = fov;
      this.camera.aspect = aspect;
      this.camera.near = near;
      this.camera.far = far;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.video.videoWidth, this.video.videoHeight);
      this.cssRenderer.setSize(this.video.videoWidth, this.video.videoHeight);

      await this.controller.dummyRun(video);

      this._resize();
      this.controller.processVideo(video);
      resolve();
    });
  }

  _resize() {
    const { renderer, cssRenderer, camera, container, video } = this;
    if (!video) return;

    let vw, vh; // display css width, height
    const videoRatio = video.videoWidth / video.videoHeight;
    const containerRatio = container.clientWidth / container.clientHeight;
    if (videoRatio > containerRatio) {
      vh = container.clientHeight;
      vw = vh * videoRatio;
    } else {
      vw = container.clientWidth;
      vh = vw / videoRatio;
    }

    video.style.top = (-(vh - container.clientHeight) / 2) + "px";
    video.style.left = (-(vw - container.clientWidth) / 2) + "px";
    video.style.width = vw + "px";
    video.style.height = vh + "px";

    const canvas = renderer.domElement;
    const cssCanvas = cssRenderer.domElement;

    canvas.style.position = 'absolute';
    canvas.style.left = video.style.left;
    canvas.style.right = video.style.right;
    canvas.style.width = video.style.width;
    canvas.style.height = video.style.height;

    cssCanvas.style.position = 'absolute';
    cssCanvas.style.left = video.style.left;
    cssCanvas.style.right = video.style.right;
    // cannot set style width for cssCanvas, because that is also used as renderer size
    //cssCanvas.style.width = video.style.width;
    //cssCanvas.style.height = video.style.height;
    cssCanvas.style.transformOrigin = "top left";
    cssCanvas.style.transform = 'scale(' + (vw / parseFloat(cssCanvas.style.width)) + ',' + (vh / parseFloat(cssCanvas.style.height)) + ')';
  }
}

if (!window.dybo) {
  window.dybo = {};
}
if (!window.dybo.FACE) {
  window.dybo.FACE = {};
}

window.dybo.FACE.dyboThree = dyboThree;
window.dybo.FACE.THREE = THREE;

