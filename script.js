/**
 * Three.js interior mapping demo
 * Author: Mohsen Heydari
 */
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/controls/OrbitControls.js'

function loadFile(filename) {
    return new Promise((resolve, reject) => {
        let loader
        if(filename.endsWith('.dds')){
            loader = new THREE.DDSLoader()
        }else{
            loader = new THREE.FileLoader()
        }
         
        loader.load(filename, 
            data => { resolve(data); }, 
            null, 
            error => {reject(error);}
        );
    });
}

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const params = {
    bottomColor: '#2c83ca',
    surfaceColor: '#fcfcfc'
}

let scene, renderer, camera, 
    controls, windowMesh, windowMat

function initialize(){
    // Scene
    scene = new THREE.Scene()
    scene.background = new THREE.Color(params.bottomColor)

    renderer = new THREE.WebGLRenderer()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
    camera.position.set(0, 0, 1.5)
    scene.add(camera)

    // Controls
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true

    window.addEventListener('resize', onResize)

    // Add renderer to page
    document.body.appendChild(renderer.domElement);

    document.addEventListener('keyup', (e)=>{
        if(e.code === "KeyA"){
            console.log(camera.position)
            console.log(camera.rotation)
        }
    })

    setupScene()
}

async function setupScene(){
    // plane
    const vertexShader = await loadFile('./shaders/vertex.glsl')
    const fragmentShader = await loadFile('./shaders/fragment.glsl')

    const cubeMap = await loadFile('./textures/cube.dds')
    cubeMap.encoding = THREE.sRGBEncoding

    windowMat = new THREE.ShaderMaterial(
        {
            uniforms: { 
                cubeMap: {value: cubeMap}
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        }
    )

    const windowGeometry = new THREE.PlaneGeometry(1, 1)
    windowGeometry.computeTangents()

    // Mesh
    windowMesh = new THREE.Mesh(windowGeometry, windowMat)
    scene.add(windowMesh)
}


function onResize(){
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

const tick = () =>
{
    // Update controls
    controls.update()

    // Render
    renderer.render( scene, camera )

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

initialize()
tick()

