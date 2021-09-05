import './style.css';
import * as THREE from 'three';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


// Variables
let container;
let camera, scene, renderer, controls;


// Global settings
const clock = new THREE.Clock();
const settings = {
    window: {
        width: window.innerWidth,
        height: window.innerHeight,
        mouseX: 0,
        mouseY: 0
    },
    elements: {
        countX: 14,
        countY: 14,
        width: 1,
        height: 1,
        gap: 2
    },
    proximity: {
        radius: 6,
        scale: 1,
        visible: true
    }
}


// Meshs
let cubes = [];
let cubeSettings = [];
let proximityDetector;
let group;


// GUI
const gui = new dat.GUI;


// Math functions
function normalize(x, pow = 2) {
    return Math.sqrt(x**pow);
}


init();
sceneAnimation();

// Initiating Scene
function init() {

    // INIT Scene
    // --------------------------------------

    scene = new THREE.Scene();


    // INIT Camera
    // --------------------------------------

    camera = new THREE.PerspectiveCamera(75, settings.window.width / settings.window.height, 0.1, 100);
    // camera = new THREE.OrthographicCamera(-6, 6, -6, 6, 0.1, 100);
    camera.position.set(0, 0, 10);
    scene.add(camera);


    // INIT Renderer
    // --------------------------------------

    container = document.querySelector('canvas.webgl');

    renderer = new THREE.WebGLRenderer({ canvas: container, antialias: true });
    renderer.setSize(settings.window.width, settings.window.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Update renderer and camera when resizing
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('mousemove', onMouseMove, false);


    // INIT Options
    // --------------------------------------

    // Controls
    addControls();

    // Lights
    addLights();

    // Cubes
    addCubes();

    // Proximity Detector
    addProximityDetector();

    console.log(proximityDetector.position)

    console.log(camera)
}

// Rendering the scene
function sceneAnimation() {
    const t = clock.getElapsedTime();

    proximityDetector.scale.set(
      settings.proximity.scale,
      settings.proximity.scale,
      settings.proximity.scale
    );

    proximityDetector.position.x = settings.window.mouseX * 5;
    proximityDetector.position.y = settings.window.mouseY * -5;

    proximityDetector.geometry.attributes.position.needsUpdate = true;
    proximityDetector.scale.needsUpdate = true;

    for (let i = 0; i < cubes.length; i++) {

        let v = new THREE.Vector3();
        let t = cubes[i].getWorldPosition(v);

        console.log(t.distanceTo(proximityDetector.position));

        if (t.distanceTo(proximityDetector.position) <= (settings.proximity.radius * settings.proximity.scale)) {
            cubes[i].scale.set(0.8, 0.8, 0.8);
            cubes[i].lookAt(proximityDetector.position);
        } else {
            cubes[i].scale.set(1, 1, 1);
            cubes[i].rotation.set(0, 0, 0);
        }

        cubes[i].geometry.attributes.position.needsUpdate = true;
    }


    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(sceneAnimation);
}


// Cubes
function addCubes() {
    let geometryCube,
        materialCube,
        meshCube;

    group = new THREE.Group();

    for (let ix = 0; ix < settings.elements.countX; ix++) {
        for (let iy = 0; iy < settings.elements.countY; iy++) {

            /*
            cubeSettings[i] = {
                speed: (Math.random() * 10) + 10,
                frequency: (Math.random() * 0.25) + 0.25,
                elevation: Math.random() * 0.25,
                distribution: {
                    x: Math.random(),
                    y: Math.random() * 3
                },
                center: 1,
                randomness: Math.random(),
                elastic: true
            }
            */

            // Geometry
            geometryCube = new THREE.BoxGeometry(
                settings.elements.width,
                settings.elements.height,
                settings.elements.height
            );

            // Material
            materialCube = new THREE.MeshLambertMaterial({ color: 0xFFC107 });
            // materialCube = new THREE.MeshMatcapMaterial();

            // Mesh
            meshCube = cubes[ix + iy] = new THREE.Mesh(geometryCube, materialCube);
            meshCube.position.x = (ix + settings.elements.gap) * 2;
            meshCube.position.y = (iy + settings.elements.gap) * 2;
            meshCube.position.z = 0;
            group.add(meshCube);
        }
    }

    // Group
    group.position.set(
      settings.elements.countX * (settings.elements.width + settings.elements.gap) * -0.5,
      settings.elements.countY * (settings.elements.height + settings.elements.gap) * -0.5,
      0
    )

    scene.add(group);
}


function addProximityDetector() {
    let geometrySphere,
        materialSphere,
        meshSphere;

    // Geometry
    geometrySphere = new THREE.SphereGeometry(settings.proximity.radius, 16, 16);

    // Material
    materialSphere = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    materialSphere.transparent = true;
    materialSphere.opacity = 0.5;

    // Mesh
    meshSphere = proximityDetector = new THREE.Mesh(geometrySphere, materialSphere);
    meshSphere.visible = settings.proximity.visible;

    scene.add(meshSphere);

    // GUI
    console.log(meshSphere)
    gui.add(settings.proximity, 'scale').min(0).max(4).step(0.01).name('Proximity');
    gui.add(meshSphere.material, 'visible').name('Visibility');
}


// Lights
function addLights() {
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xFFEB3B, 1, 500);
    pointLight1.position.set(8, 5, 8);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xF39914, 1, 500);
    pointLight2.position.set(-5, -10, 2);
    scene.add(pointLight2);

    const sphereSize = 1;
    const pointLightHelper1 = new THREE.PointLightHelper( pointLight1, sphereSize );
    const pointLightHelper2 = new THREE.PointLightHelper( pointLight2, sphereSize );
    scene.add(pointLightHelper1, pointLightHelper2);
}


// Controls
function addControls() {
    controls = new OrbitControls(camera, container);
    controls.screenSpacePanning = true;
    controls.enableDamping = true
    controls.update();
}


// Out of scope functions
function onWindowResize() {

    // Update sizes
    settings.window.width = window.innerWidth;
    settings.window.height = window.innerHeight;

    // Update camera
    camera.aspect = settings.window.width / settings.window.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(settings.window.width, settings.window.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function onMouseMove(e) {
    settings.window.mouseX = (1 / window.innerWidth * e.clientX) - 0.5;
    settings.window.mouseY = (1 / window.innerHeight * e.clientY) - 0.5;
    // console.log(e);
}
