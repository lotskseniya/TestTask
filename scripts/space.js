import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";


const canvas = document.getElementById('globeCanvas')

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 30, canvas.clientWidth/ canvas.clientHeight );
    camera.position.set( 2, 5, 10 );
    camera.lookAt( scene.position );

const renderer = new THREE.WebGLRenderer( {antialias: true, alpha: true} );
    renderer.setSize( canvas.clientWidth-16, canvas.clientHeight-16 );
    renderer.setClearColor( 0x000000, 0 );
    renderer.setAnimationLoop( animationLoop );
    canvas.appendChild( renderer.domElement );


const controls = new OrbitControls( camera, renderer.domElement );
    controls.enableDamping = true;

const ambientLight = new THREE.AmbientLight( 'white', 0.5 );
    scene.add( ambientLight );


const light = new THREE.DirectionalLight( 'white', 2 );
    light.position.set( 1, 1, 1 );
    scene.add( light );

  const globe = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.6, 8),
     new THREE.MeshPhongMaterial({
        color: 0xffffff,
        wireframe: true,
      })
    );
  scene.add( globe );


function animationLoop( t )
{
  console.log(innerWidth)

    globe.rotation.x = Math.sin( t/700 );
    globe.rotation.y = Math.sin( t/900 );

    controls.update( );
		light.position.copy( camera.position );
    renderer.render( scene, camera );
}


