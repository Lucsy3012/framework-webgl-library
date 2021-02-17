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
        height: window.innerHeight
    },
    audioWaves: {
        count: 3,
        width: 2,
        height: 12
    }
}


// Meshs
let audioWaves = [];
let audioWaveSettings = [];


// Textures
const textureLoader = new THREE.TextureLoader();
const textureRed = textureLoader.load('/textures/red.png');
const textureBlue = textureLoader.load('/textures/blue.png');
const textureWhite = textureLoader.load('/textures/white.png');
const textureDisplacementMap = textureLoader.load('/textures/displacement-map.jpg');
const textures = [textureRed, textureBlue, textureWhite];
const colors = [0x00aaff, 0xcf008d, 0xefe0dd];
// const colors = [0xffaa00, 0x00bb88, 0xff0044];


// GUI
const gui = new dat.GUI;


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


    // INIT Options
    // --------------------------------------

    // Controls
    addControls();

    // Audio Waves
    addAudioWaves();

    // Plane
    addPlane();
}

// Rendering the scene
function sceneAnimation() {
    const elapsedTime = clock.getElapsedTime();

    // Update meshs
    for (let i = 0; i < audioWaves.length; ++i) {

        const vertices = audioWaves[i].geometry.attributes.position;
        const speed = audioWaveSettings[i].speed;
        const frequency = audioWaveSettings[i].frequency;
        const elevation = audioWaveSettings[i].elevation;
        const offset = audioWaveSettings[i].offset;

        for (let v = 0; v < vertices.count; ++v) {
            const x = (v * vertices.itemSize);
            const y = (v * vertices.itemSize) + 1;
            const z = (v * vertices.itemSize) + 2;
            const itemSize = vertices.itemSize;

            vertices.array[z] =
                (Math.sin(audioWaves[i].startX + (elapsedTime * speed) + (v / itemSize) / 500 * frequency) * elevation) * // standardized Z
                ((vertices.array[x] - offset) * elevation) // offset X
            ;
        }

        audioWaves[i].geometry.attributes.position.needsUpdate = true;
    }

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(sceneAnimation);
}


// Audio Waves
function addAudioWaves(count = settings.audioWaves.count) {
    let geometryAudioWave,
        materialAudioWave,
        meshAudioWave;

    for (let i = 0; i < count; i++) {

        audioWaveSettings[i] = {
            speed: Math.random() * 10,
            frequency: Math.random() * 0.1,
            elevation: Math.random(),
            offset: 0
        }

        // Geometry
        geometryAudioWave = new THREE.PlaneGeometry(
            settings.audioWaves.width,
            settings.audioWaves.height,
            settings.audioWaves.width * 50,
            settings.audioWaves.height * 50
        );

        // Material
        // materialAudioWave = new THREE.MeshBasicMaterial({ color: colors[i] });
        materialAudioWave = new THREE.MeshMatcapMaterial();
        materialAudioWave.matcap = textures[i];
        materialAudioWave.wireframe = false;
        materialAudioWave.side = THREE.DoubleSide;
        materialAudioWave.transparent = false;
        materialAudioWave.opacity = 1;
        materialAudioWave.blending = 2;
        materialAudioWave.displacementMap = textureDisplacementMap;
        materialAudioWave.displacementScale = 0;

        // Mesh
        meshAudioWave = audioWaves[i] = new THREE.Mesh(geometryAudioWave, materialAudioWave);
        meshAudioWave.position.z = i - count;
        meshAudioWave.rotation.x = Math.PI * 0.5;
        meshAudioWave.rotation.z = Math.PI * 0.5;
        scene.add(meshAudioWave);

        // Add random seeds
        meshAudioWave.startX = Math.random() * Math.PI;
        meshAudioWave.startY = Math.random() * Math.PI;

        // GUI
        const wavesFolder = gui.addFolder('Wave ' + [i+1]);
        wavesFolder.add(audioWaveSettings[i], 'speed').min(0).max(10).step(0.01).name('Speed');
        wavesFolder.add(audioWaveSettings[i], 'frequency').min(0).max(0.5).step(0.01).name('Frequency');
        wavesFolder.add(audioWaveSettings[i], 'elevation').min(0).max(1).step(0.01).name('Elevation');
        wavesFolder.add(audioWaveSettings[i], 'offset').min(0).max(5).step(0.01).name('Offset');
        wavesFolder.add(meshAudioWave, 'startX').min(0).max(Math.PI).step(0.01).name('Start X');
        wavesFolder.add(meshAudioWave.material, 'displacementScale').min(0).max(1).step(0.001).name('Displacement Scale');
        wavesFolder.add(meshAudioWave.material, 'wireframe').name('Wireframe');

        console.log(meshAudioWave);
    }
}


function addPlane() {
    let geometryPlane,
        materialPlane,
        meshPlane;
    
    // Geometry
    geometryPlane = new THREE.PlaneGeometry(9, 8, 1, 1);
    
    // Material
    materialPlane = new THREE.MeshBasicMaterial({ color: 0x050505 });
    materialPlane.transparent = false;
    materialPlane.side = THREE.DoubleSide;

    // Mesh
    meshPlane = new THREE.Mesh(geometryPlane, materialPlane);
    meshPlane.position.set(0, 0, 2);
    meshPlane.visible = false;

    scene.add(meshPlane);

    // GUI
    gui.add(meshPlane, 'visible').name('Overlay');
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