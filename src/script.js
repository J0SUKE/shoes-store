import './css/style.css';

import * as THREE from "three";
import { RedFormat, Scene, Vector3 } from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js"

/**
 * Scene
 */
let container = document.querySelector(".canvas-container");
let canvasElement = document.querySelector(".shoeCanvas");

//Gestion des dimensions 
let sizes = {
    width:0,
    height:0,
}

//Gestion du resize

if (window.innerWidth>=980) {
    sizes.width=Math.min(container.getBoundingClientRect().width,682);
    sizes.height=500;
}
else
{
    sizes.width=container.getBoundingClientRect().width;
    if (window.innerWidth<=490) {
        sizes.height=300;    
    }
    else sizes.height=500;    
}


const{height,width} = sizes;
const scene = new THREE.Scene();

/**
 * Camera and renderer
 */

const camera = new THREE.PerspectiveCamera( 65, width / height, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer(
    {
        canvas:canvasElement,
        alpha:true,
        antialias:true
    }
);

renderer.shadowMap.enabled=true;
renderer.shadowMap.type = THREE.PCFShadowMap;

renderer.physicallyCorrectLights = true;

renderer.setSize(width,height);
camera.position.set(0,0.5,2);

//handle window resizing function

function handleResizing() {
    sizes.width=container.getBoundingClientRect().width;    
    
    if (sizes.width<=450) {
        sizes.height=300;    
    }
    else
    {
        sizes.height=500;    
    }

    const{width,height} = sizes;
    camera.aspect=width/height;
    camera.updateProjectionMatrix();
    //update the renderer
    renderer.setSize(width,height);
}

window.addEventListener("resize",handleResizing)


/**
 * Load the Model 
 */

let gtfLoader = new GLTFLoader();
let modelPath = "model/glTF/MaterialsVariantsShoe.gltf";

let model3D=null;

// Fonction qui vas s'occuper de charger le Model 2D

let layer = document.querySelector(".layer");

let loadModel = (model)=>{

    model.scene.traverse( function( node ) {
        if ( node.isMesh ) { node.castShadow = true; }
    } );

    model.scene.children[0].scale.set(1,1,1);
    model.scene.children[0].castShadow=true;
    
    model3D=model.scene.children[0];

    model3D.children[0].rotation.z = -1/2;

    // Lorce que le model est chargé on supprime le layer

    layer.style.display = "none";

    scene.add(model.scene);
}


gtfLoader.load(
    modelPath,
    loadModel    
)

/**
 * Floor
 */
let floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10,10),
    new THREE.MeshStandardMaterial(
        {
            color:"white",
        }
    )
)
floor.rotation.x = -Math.PI/2;
floor.position.y = -1;
floor.receiveShadow=true;
scene.add(floor)

/**
 * Lights
 */
let ambientLight = new THREE.AmbientLight("white",1)
scene.add(ambientLight)

//directional light
let directionalLight = new THREE.DirectionalLight("white",5)

directionalLight.castShadow=true;
directionalLight.shadow.camera.far=6;
directionalLight.shadow.camera.near=0;

directionalLight.shadow.mapSize.width=2048;
directionalLight.shadow.mapSize.height=2048;

directionalLight.position.set(0,2,2)

scene.add(directionalLight)

//render the scene
renderer.render(scene,camera);

/**
 * Gestion de la partie interaction avec le model 3D
 */


//let handle cursor 
let userHasInteracted=false;

let isClicking = false;

let firstClick = {
    x:0,
    y:0
}

//fonction qui gere la salection du model

let selection = (e)=>{
    userHasInteracted=true;
    if (!isClicking) {
        firstClick.x = e.offsetX;
        firstClick.y = e.offsetY;
    }
    isClicking=true;
}

//fonction qui gere les mouvements de curseur
let mouseMouvement = (e)=>{
    if (!isClicking) return;
    
    let width=canvasElement.getBoundingClientRect().width;
    let height=canvasElement.getBoundingClientRect().height;

    distanceX = (e.offsetX-firstClick.x)/(width*5);
    distanceY = (e.offsetY-firstClick.y)/(height*5);
}

canvasElement.addEventListener("mousedown",selection)


//curseur vers le haut-bas ==> rotation dans l'axe X
//curseur vers la gauche-droite ==> rotation dans l'axe Y
let distanceX=0;
let distanceY=0;

canvasElement.addEventListener("mousemove",mouseMouvement);

canvasElement.addEventListener("mouseup",(e)=>
{
    isClicking=false;
})
canvasElement.addEventListener("mouseleave",(e)=>
{
    isClicking=false;
})


//animate

let clock = new THREE.Clock();

function animate() {

    let elapsedTime= clock.getElapsedTime();

    if (model3D) 
    {
        camera.lookAt(model3D.position)

        if (!userHasInteracted) {
            model3D.children[0].rotation.y=(elapsedTime/2);    
        }

        if (!isClicking) {
            distanceX/=1.05;
            distanceY/=1.05;
        }

        model3D.children[0].rotation.y+=distanceX;
        model3D.children[0].rotation.x+=distanceY;

    }

	renderer.render( scene, camera );
    requestAnimationFrame( animate );
}

animate();



