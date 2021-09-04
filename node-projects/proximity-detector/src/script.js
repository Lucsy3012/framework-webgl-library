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
        countX: 40,
        countY: 40,
        width: 5,
        height: 5,
    },
    proximity: {
        radius: 20,
        visible: false
    }
}


// Meshs
let cubes = [];
let cubeSettings = [];
let proximityDetector;


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

    // camera = new THREE.PerspectiveCamera(75, settings.window.width / settings.window.height, 0.1, 100);
    camera = new THREE.OrthographicCamera(-6, 6, -6, 6, 0.1, 100);
    camera.position.set(0, 0, 3);
    camera.lookAt(0, 0, 0);
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
}

// Rendering the scene
function sceneAnimation() {
    const t = clock.getElapsedTime();

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(sceneAnimation);
}


// Cubes
function addCubes(count = settings.elements.count) {
    let geometryCube,
        materialCube,
        meshCube;

    for (let i = 0; i < count; i++) {

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
        geometryCube = new THREE.CubeGeometry(
            settings.elements.width,
            settings.elements.height,
            settings.elements.height
        );

        // Material
        materialCube = new THREE.MeshBasicMaterial({ color: 0x94ff19 });
        // materialCube = new THREE.MeshMatcapMaterial();

        // Mesh
        meshCube = cubes[i] = new THREE.Mesh(geometryCube, materialCube);
        meshCube.position.x = i;
        meshCube.position.y = i;
        meshCube.position.z = 0;
        scene.add(meshCube);

        console.log(meshCube);
    }
}


function addProximityDetector() {
    let geometrySphere,
        materialSphere,
        meshSphere;
    
    // Geometry
    geometrySphere = new THREE.SphereGeometry(settings.proximity.radius, 16, 16);
    
    // Material
    materialSphere = new THREE.MeshBasicMaterial({ color: 0x050505 });
    materialSphere.transparent = true;
    materialSphere.opacity = 0.33;

    // Mesh
    meshSphere = proximityDetector = new THREE.Mesh(geometrySphere, materialSphere);
    meshSphere.visible = false;
    meshSphere.opacity = 0.33;

    scene.add(meshSphere);

    // GUI
    gui.add(settings.proximity, 'radius').min(0).max(200).step(0.01).name('Proximity');
    gui.add(settings.proximity, 'visible').min(0).max(200).step(0.01).name('Visibility');
}


// Lights
function addLights() {
    const ambientLight = new THREE.AmbientLight(0xCC8423, 1);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00ffff, 1, 500);
    pointLight.position.set(0, 0, 50);

    scene.add(pointLight);
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
    settings.window.mouseX = e.clientX;
    settings.window.mouseY = e.clientY;
    console.log(e);
}