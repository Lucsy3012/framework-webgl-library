import './style.css';
import * as THREE from 'three';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


// Variables
let container;
let camera, scene, renderer, controls;
let vec = new THREE.Vector3(); // for mouseWorldPosition create once and reuse
let pos = new THREE.Vector3(); // for mouseWorldPosition create once and reuse


// Global settings
const clock = new THREE.Clock();
const settings = {
    window: {
        width: window.innerWidth,
        height: window.innerHeight,
        mouseX: 0,
        mouseY: 0
    },
    cubes: {
        countX: 14,
        countY: 14,
        width: 1,
        height: 1,
        gap: 2,
        animationDuration: 1,
    },
    spheres: {
        countX: 50,
        countY: 50,
        radius: 0.125,
        gap: 3,
        animationDuration: 0.125,
    },
    proximity: {
        radius: 6,
        scale: 1,
        visible: false,
        wireframe: false
    }
}


// Meshs
let cubes = [];
let cubeSettings = [];
let spheres = [];
let sphereSettings = {
    scale: 1,
    passiveColor: 0x223344,
    activeColor3: 0x223388,
    activeColor2: 0x223FBB,
    activeColor: 0x2244EE,
}
let proximityDetector;
let group;


// GUI
const gui = new dat.GUI;


// Math functions
function normalize(x, pow = 2) {
    return Math.sqrt(x**pow);
}

function easeInOut(x) {
    return Math.pow(Math.sin(x * Math.PI / 2), 2);
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

    camera = new THREE.PerspectiveCamera(45, settings.window.width / settings.window.height, 0.1, 1000);
    // camera = new THREE.OrthographicCamera(-6, 6, -6, 6, 0.1, 100);
    camera.position.set(0, 0, 30);
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
    // addCubes();

    // Spheres
    addSpheres();

    console.log(spheres)

    // Proximity Detector
    addProximityDetector();
}

// Rendering the scene
function sceneAnimation() {
    const t = clock.getElapsedTime();

    // Update sensor
    positionOnMouseWorldPosition(proximityDetector);

    proximityDetector.scale.set(
      settings.proximity.scale,
      settings.proximity.scale,
      settings.proximity.scale
    );

    proximityDetector.material.visible = settings.proximity.visible;
    proximityDetector.material.wireframe = settings.proximity.wireframe;
    proximityDetector.material.needsUpdate = true;

    proximityDetector.geometry.attributes.position.needsUpdate = true;
    proximityDetector.scale.needsUpdate = true;

    // console.log(t)

    // Update cubes
    /*
    if (cubes.length > 1) {
        for (let i = 0; i < cubes.length; i++) {
            const cube = cubes[i];
            let v = new THREE.Vector3();
            let p = cube.getWorldPosition(v);


            // Approach 0 to 1 with ease-in-out function in y frames
            // let x = (t - snapshotFrame) / settings.cubes.animationDuration;
            // let progress = easeInOut(x);

            if (p.distanceTo(proximityDetector.position) <= (settings.proximity.radius * settings.proximity.scale)) {
                cube.scale.set(0.8, 0.8, 0.8);
                cube.lookAt(proximityDetector.position);
                cube.material.color.set(0xFF0000);
            } else {
                cube.scale.set(1, 1, 1);
                cube.rotation.set(0, 0, 0);
                cube.material.color.set(0xFFC107);
            }

            cube.geometry.attributes.position.needsUpdate = true;
        }
    }
     */

    // Update Spheres
    if (spheres.length > 1) {

        for (let i = 0; i < spheres.length; i++) {
            const sphere = spheres[i];
            let v = new THREE.Vector3();
            let p = sphere.getWorldPosition(v);


            // Approach 0 to 1 with ease-in-out function in y frames
            // let x = (t - snapshotFrame) / settings.sphere.animationDuration;
            // let progress = easeInOut(x);

            if (p.distanceTo(proximityDetector.position) <= (settings.proximity.radius * settings.proximity.scale)) {
                sphere.material.color.set(sphereSettings.activeColor);
                sphere.scale.set(
                  sphereSettings.scale,
                  sphereSettings.scale,
                  sphereSettings.scale
                );
            } else {
                sphere.scale.set(1, 1, 1);
                sphere.material.color.set(sphereSettings.passiveColor);
            }

            sphere.geometry.attributes.position.needsUpdate = true;
        }
    }

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(sceneAnimation);
}


// Meshs
function addCubes() {
    let geometryCube,
        materialCube,
        meshCube;

    group = new THREE.Group();

    let i = 0, ix, iy;

    for (ix = 0; ix < settings.cubes.countX; ++ix) {
        for (iy = 0; iy < settings.cubes.countY; ++iy) {

            // Geometry
            geometryCube = new THREE.BoxGeometry(
                settings.cubes.width,
                settings.cubes.height,
                settings.cubes.height
            );

            // Material
            materialCube = new THREE.MeshLambertMaterial({ color: 0xFFC107 });
            // materialCube = new THREE.MeshMatcapMaterial();

            // Mesh
            meshCube = cubes[i++] = new THREE.Mesh(geometryCube, materialCube);
            meshCube.position.x = (ix + settings.cubes.gap) * 2;
            meshCube.position.y = (iy + settings.cubes.gap) * 2;
            meshCube.position.z = 0;
            group.add(meshCube);
        }
    }

    // Group
    group.position.set(
      settings.cubes.countX * (settings.cubes.width + settings.cubes.gap) * -0.5,
      settings.cubes.countY * (settings.cubes.height + settings.cubes.gap) * -0.5,
      0
    )

    scene.add(group);
}

function addSpheres() {
    let geometrySphere,
        materialSphere,
        meshSphere;

    group = new THREE.Group();

    // Geometry
    geometrySphere = new THREE.SphereBufferGeometry(
      settings.spheres.radius, 8, 8
    );

    let i = 0, ix, iy;

    for (ix = 0; ix < settings.spheres.countX; ++ix) {
        for (iy = 0; iy < settings.spheres.countY; ++iy) {

            // Material
            materialSphere = new THREE.MeshLambertMaterial({ color: sphereSettings.passiveColor });
            // materialSphere = new THREE.MeshMatcapMaterial();

            // Mesh
            meshSphere = spheres[i++] = new THREE.Mesh(geometrySphere, materialSphere);
            meshSphere.position.x = (ix + settings.spheres.gap);
            meshSphere.position.y = (iy + settings.spheres.gap);
            meshSphere.position.z = 0;
            group.add(meshSphere);

            // GUI
            // const spheresFolder = gui.addFolder('Spheres');
            // gui.add(sphereSettings, 'scale').min(0).max(2).step(0.01).name('Radius');
            // spheresFolder.addColor(sphereSettings, 'passiveColor').name('Inactive Color');
            // spheresFolder.addColor(sphereSettings, 'activeColor').name('Active Color');
        }
    }

    gui.add(sphereSettings, 'scale').min(0).max(2).step(0.01).name('Radius');

    // Group
    group.position.set(
      settings.spheres.countX * -0.55,
      settings.spheres.countY * -0.55,
      0
    )

    console.log(group.position);

    scene.add(group);
}


function addProximityDetector() {
    let geometrySensor,
        materialSensor,
        meshSensor;

    // Geometry
    geometrySensor = new THREE.SphereGeometry(settings.proximity.radius, 16, 16);

    // Material
    materialSensor = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    materialSensor.transparent = true;
    materialSensor.opacity = 0.5;
    materialSensor.visible = settings.proximity.visible;
    materialSensor.wireframe = settings.proximity.wireframe;

    // Mesh
    meshSensor = proximityDetector = new THREE.Mesh(geometrySensor, materialSensor);

    scene.add(meshSensor);

    // GUI
    console.log(meshSensor)
    // const sensorFolder = gui.addFolder('Sensor');
    gui.add(settings.proximity, 'scale').min(0).max(4).step(0.01).name('Proximity');
    gui.add(settings.proximity, 'visible').name('Visibility');
    gui.add(settings.proximity, 'wireframe').name('Wireframe');
}


// Functionality
function positionOnMouseWorldPosition(el) {
    vec.set(
      settings.window.mouseX,
      settings.window.mouseY * -1,
      0.5);

    vec.unproject(camera);
    vec.sub(camera.position).normalize();

    const distance = -camera.position.z / vec.z;

    el.position.copy(camera.position).add(vec.multiplyScalar(distance));

    // el.position = pos
    el.geometry.attributes.position.needsUpdate = true;
}


// Lights
function addLights() {
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x4499FF, 1, 150);
    pointLight1.position.set(15, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x22EE99, 1, 150);
    pointLight2.position.set(-15, -10, 10);
    scene.add(pointLight2);

    // const sphereSize = 1;
    // const pointLightHelper1 = new THREE.PointLightHelper( pointLight1, sphereSize );
    // const pointLightHelper2 = new THREE.PointLightHelper( pointLight2, sphereSize );
    // scene.add(pointLightHelper1, pointLightHelper2);
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
    settings.window.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    settings.window.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
}
