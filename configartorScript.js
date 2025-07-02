import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Initialization of the renderer:
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Better shadow quality
renderer.setClearColor(0xffffff);

// Setup of scene and camera:
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 1.33);

// Initialization of controls:
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.12;
controls.enableZoom = true;

// Materials are created globally, so they can be accessed by functions, that change them:
let materials = {};
let colors = {};
let metals = {};
let backpackModel = null;
const metalButtons = document.querySelectorAll("[data-metal]");
const fabricButtons = document.querySelectorAll("[data-fabric]");
const colorButtons = document.querySelectorAll("[data-color]");

function init() {
  const canvas = document.getElementById("backpackCanvas");
  if (canvas) {
    canvas.appendChild(renderer.domElement);
  } else {
    console.error("Element with ID 'backpackCanvas' not found");
    document.body.appendChild(renderer.domElement);
  }
}

function setupLight() {
  // Ambient light:
  const ambientLight = new THREE.AmbientLight(0x404040, 12);
  scene.add(ambientLight);

  // Main directional light:
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(-3, 40, 2);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 5;
  directionalLight.shadow.camera.far = 5;
  scene.add(directionalLight);
}

function createColor() {
  const colorLoader = new THREE.Color();
  const colorsConfig = {
    brown: 0xcb8240,
    black: 0x574952,
    blue: 0x4169e1,
  };

  // Colors creation:
  for (const [key, value] of Object.entries(colorsConfig)) {
    const color = new THREE.Color(value);
    colors[key] = color;
  }

  if (colors) {
    window.currentColor = colors.brown;
    window.currentColorName = "brown";
    const brownButton = document.querySelector('[data-color="brown"]');
    if (brownButton) {
      brownButton.classList.add("active");
    } else {
      console.error('Button with data-color="brown" not found');
    }

    if (window.currentModel) {
      applyFabricToModel(colors.brown);
    }
  }
  return colors;
}

function createFabrics() {
  const textureLoader = new THREE.TextureLoader();

  // Error handling for texture loading
  const loadTexture = (path) => {
    return textureLoader.load(
      path,
      undefined, // onLoad
      undefined, // onProgress
      (error) => console.warn(`Failed to load texture: ${path}`, error)
    );
  };

  const materialConfigs = {
    leather: {
      texturePath: "/backpack/leather_baseColor.jpg",
      metalness: 0.1,
      roughness: 0.4,
    },
    fabric: {
      texturePath: "/backpack/leather_baseColor.jpg",
      metalness: 0.2,
      roughness: 0.85,
    },
    denim: {
      texturePath: "/backpack/leather_baseColor.jpg",
      roughness: 1,
      metalness: 0.0,
    },
  };

  // Fabrics creation:
  for (const [key, config] of Object.entries(materialConfigs)) {
    const texture = loadTexture(config.texturePath).flipY = false;
    
    materials[key] = new THREE.MeshStandardMaterial({
      map: texture,
      metalness: config.metalness,
      roughness: config.roughness,
      side: THREE.DoubleSide,
    });
  }

  if (materials.leather) {
    window.currentFabric = materials.leather;
    window.currentFabricName = "leather";
    const leatherButton = document.querySelector('[data-fabric="leather"]');
    if (leatherButton) {
      leatherButton.classList.add("active");
    } else {
      console.error('Button with data-fabric="leather" not found');
    }

    if (window.currentModel) {
      applyFabricToModel(materials.leather);
    }
  }

  return materials;
}

function createMetals() {
  const textureLoader = new THREE.TextureLoader();

  // procedural noise texture for metal surface variation:
  function createNoiseTexture(size = 512) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    // Generate noise pattern
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 0.3 + 0.7;
      data[i] = noise * 255; // R
      data[i + 1] = noise * 255; // G
      data[i + 2] = noise * 255; // B
      data[i + 3] = 255; // A
    }

    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);

    const silverButton = document.querySelector('[data-metal="silver"]');
    if (silverButton) {
      silverButton.classList.add("active");
    } else {
      console.error('Button with data-metal="silver" not found');
    }

    return texture;
  }

  // normal map for surface detail
  function createNormalMap(size = 512) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // subtle surface variation
      const variation = Math.random() * 0.1 + 0.45;
      data[i] = 128 + variation * 127;
      data[i + 1] = 128 + variation * 127;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);

    return texture;
  }

  const noiseTexture = createNoiseTexture();
  const normalMap = createNormalMap();

  const metalConfigs = {
    silver: {
      texturePath: "/assets/black-metal.png",
      metalness: 1.0,
      roughness: 0.2,
    },
    gold: {
      color: new THREE.Color(0xffd700),
      map: noiseTexture.clone(),
      normalMap: normalMap.clone(),
      metalness: 1.0,
      roughness: 0.15,
      envMapIntensity: 0.8,
      clearcoat: 0.2,
      clearcoatRoughness: 0.15,
    },
    black: {
      color: new THREE.Color(0xc0c0c0),
      map: noiseTexture.clone(),
      normalMap: normalMap.clone(),
      metalness: 0.9,
      roughness: 0.05,
      envMapIntensity: 1.0,
      clearcoat: 0.3,
      clearcoatRoughness: 0.1,
    },
  };

  // Metals creation:
  for (const [key, config] of Object.entries(metalConfigs)) {
    metals[key] = new THREE.MeshPhysicalMaterial({
      color: config.color,
      map: config.map,
      normalMap: config.normalMap,
      normalScale: new THREE.Vector2(0.5, 0.5),
      metalness: config.metalness,
      roughness: config.roughness,
      envMapIntensity: config.envMapIntensity,
      clearcoat: config.clearcoat,
      clearcoatRoughness: config.clearcoatRoughness,
      side: THREE.FrontSide,
    });
  }

  return {
    metals: metals,
    currentMetal: metals.silver,
    currentMetalName: "silver",
  };
}

function loadModel() {
  const loader = new GLTFLoader();

  loader.load(
    "/backpack/backpack.glb",
    function (glb) {
      backpackModel = glb.scene;
      console.log("Model loaded successfully:", backpackModel);

      // Enable shadows for all meshes:
      backpackModel.traverse(function (node) {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });

      scene.add(backpackModel);
      window.currentModel = backpackModel;

      if (window.currentFabric) {
        applyFabricToModel(window.currentFabric);
      }
    },
    function (error) {
      console.error("Error loading model:", error);
    }
  );
}

function changeColor(colorName) {
  if (!colors[colorName]) {
    console.error(`Color "${colorName}" not found`);
    return;
  }
  const color = colors[colorName];

  if (backpackModel) {
    backpackModel.traverse(function (node) {
      if (node.isMesh) {
        console.log(`Changing color of mesh: "${node.name}"`); 

        // Change color only for the main mesh and straps:
        if (node.name === "Mesh" || node.name === "Mesh_2") {
          node.material.needsUpdate = true;
          node.material.color.set(color);
        }
        // Update the current color globally
        window.currentColor = color;
        window.currentColorName = colorName;

        colorButtons.forEach((button) => {
          if (button.dataset.color === colorName) {
            button.classList.add("active");
          } else {
            button.classList.remove("active");
          }
        }
        );
      }
    });
  }
}

function changeFabric(materialName) {
  if (!materials[materialName]) {
    console.error(`Material "${materialName}" not found`);
    return;
  }

  const material = materials[materialName];

  if (backpackModel) {
    backpackModel.traverse(function (node) {
      if (node.isMesh) {
        // Fabric applied only on a main mesh, without straps:
        if (node.name === "Mesh") {
          if (!node.originalMaterial) {
            node.originalMaterial = node.material;
          }

          node.material = material.clone(); 
          node.material.needsUpdate = true;
          node.material.color.set(window.currentColor);
          node.material.map.wrapS = THREE.RepeatWrapping;
          node.material.map.wrapT = THREE.RepeatWrapping;
          node.material.map.repeat.set(3, 3);
        }

        // Fabric applied to straps:
        if (node.name === "Mesh_2") {
          node.material = material.clone();
          node.material.needsUpdate = true;
          node.material.color.set(window.currentColor);
          node.material.map.wrapS = THREE.RepeatWrapping;
          node.material.map.wrapT = THREE.RepeatWrapping;
          node.material.map.repeat.set(2, 2);
        }

        // active class added to the clicked button:
        fabricButtons.forEach((button) => {
          if (button.dataset.fabric === materialName) {
            button.classList.add("active");
          } else {
            button.classList.remove("active");
          }
        });
      }
    });
  } else {
    console.warn("Backpack model not loaded yet");
  }
}

function changeMetal(metalName) {
  if (!metals[metalName]) {
    console.error(`Metal "${metalName}" not found`);
    return;
  }

  const metal = metals[metalName];

  if (backpackModel) {
    backpackModel.traverse(function (node) {
      if (node.isMesh) {
        console.log(`Changing metal of mesh: "${node.name}"`);

        // Changing buckles` metal color:
        if (node.name === "Mesh_1") {
          node.material = metal.clone();
          node.material.needsUpdate = true;
          node.material = metal;
        }
      }
    });
  } else {
    console.warn("Backpack model not loaded yet");
  }
  window.currentMetal = metal;
  window.currentMetalName = metalName;

  metalButtons.forEach((button) => {
    if (button.dataset.metal === metalName) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}

function applyFabricToModel(material) {
  if (backpackModel) {
    backpackModel.traverse(function (node) {
      if (node.isMesh) {

        // Change of the fabric of the main mesh and straps:
        if (node.name === "Mesh" || node.name === "Mesh_2") {
          node.material = material;
          node.material.needsUpdate = true;
          node.material.color.set(window.currentColor);
          node.material.map.wrapS = THREE.RepeatWrapping;
          node.material.map.wrapT = THREE.RepeatWrapping;
          node.material.map.repeat.set(3, 3);
        }
      }
    });
  }
}

function animate() {
  controls.update();
  renderer.render(scene, camera);
}

// Window resize handler
function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function initScene() {
  init();
  setupLight();
  createColor();
  createFabrics();
  createMetals();
  loadModel();
}

renderer.setAnimationLoop(animate);

window.addEventListener("load", initScene);
window.addEventListener("resize", handleResize);
window.addEventListener("orientationchange", handleResize);

                   // For more comfort DevTools device simulation:
let lastWidth = window.innerWidth;
let lastHeight = window.innerHeight;

function checkForSizeChange() {
    if (window.innerWidth !== lastWidth || window.innerHeight !== lastHeight) {
        lastWidth = window.innerWidth;
        lastHeight = window.innerHeight;
        handleResize();
    }
}
// Poll for size changes (useful for DevTools)
setInterval(checkForSizeChange, 100);

// Export functions for external use
window.changeColor = changeColor;
window.changeFabric = changeFabric;
window.changeMetal = changeMetal;

