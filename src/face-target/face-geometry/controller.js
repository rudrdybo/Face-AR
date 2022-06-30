const THREE = window.dybo.FACE.THREE;
    // import { GLTFLoader } from 'three/examples/jsm/controls/loaders'

    const dyboThree = new window.dybo.FACE.dyboThree({
      container: document.querySelector("#container"),
      filterMinCF: 1.0,
      filterBeta: 0.035,
    });
    const { renderer, scene, camera } = dyboThree;

    const anchor = dyboThree.addAnchor(168);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    const faceMesh = dyboThree.addFaceMesh();
    // const texture = new THREE.TextureLoader().load('./assets/canonical_face_model_uv_visualization.png');
    // faceMesh.material.map = texture;
    faceMesh.material.transparent = true;
    faceMesh.material.opacity = 0.9

    faceMesh.material.needsUpdate = true;
    // scene.add(faceMesh);


    dyboThree.addModel(
      (model) => {
        anchor.group.add(model);
      }
    );

    const start = async () => {
      await dyboThree.start();
      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });
    }
    start();