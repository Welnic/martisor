import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "lil-gui";

/**
 * Debug
 */
const gui = new dat.GUI();

// Scene
const scene = new THREE.Scene();

// Canvas
const canvas = document.querySelector("canvas.webgl");

const heartGroup = new THREE.Group();
// Heart Object
const heartX = -100;
const heartY = 0;
const heartShape = new THREE.Shape();
heartShape.moveTo(25 + heartX, 25 + heartY);
heartShape.bezierCurveTo(25 + heartX, 25 + heartY, 20 + heartX, 0 + heartY, 0 + heartX, 0 + heartY);
heartShape.bezierCurveTo(-30 + heartX, 0 + heartY, -30 + heartX, 35 + heartY, -30 + heartX, 35 + heartY);
heartShape.bezierCurveTo(-30 + heartX, 55 + heartY, -10 + heartX, 77 + heartY, 25 + heartX, 95 + heartY);
heartShape.bezierCurveTo(60 + heartX, 77 + heartY, 80 + heartX, 55 + heartY, 80 + heartX, 35 + heartY);
heartShape.bezierCurveTo(80 + heartX, 35 + heartY, 80 + heartX, 0 + heartY, 50 + heartX, 0 + heartY);
heartShape.bezierCurveTo(35 + heartX, 0 + heartY, 25 + heartX, 25 + heartY, 25 + heartX, 25 + heartY);

const extrudeSettings = {
	depth: 8,
	bevelEnabled: true,
	bevelSegments: 2,
	steps: 2,
	bevelSize: 1,
	bevelThickness: 1,
};
const materialRed = new THREE.MeshBasicMaterial({
	color: 0xff0000,
});
const materialWhite = new THREE.MeshBasicMaterial({
	color: 0xffffff,
});
const geometryHeart1 = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
const geometryHeart2 = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
const mesh1 = new THREE.Mesh(geometryHeart1, materialRed);
const mesh2 = new THREE.Mesh(geometryHeart2, materialWhite);
mesh1.scale.set(0.01, 0.01, 0.01);
mesh1.rotation.set(0, 0, Math.PI + Math.PI / 24);
mesh2.scale.set(0.01, 0.01, 0.01);
mesh2.rotation.set(0, 0, Math.PI - Math.PI / 29);
mesh1.position.set(-2.1, -1.1, 0);
mesh2.position.set(0, -0.7, 0);

heartGroup.add(mesh1, mesh2);
scene.add(heartGroup);

heartGroup.position.set(0.332, -0.8, 0);
gui.add(heartGroup.position, "x").min(-20).max(20).step(0.0001);
gui.add(heartGroup.position, "y").min(-20).max(20).step(0.0001);

const materialLine = new THREE.LineBasicMaterial({ color: 0x0000ff });
const points1 = [];
//The bow has vertical tangents at (+/-2/9sqrt(3),2/9) and horizontal tangents at (+/-1/4sqrt(2),1/4).
points1.push(new THREE.Vector3((2 / 9) * Math.sqrt(3), 0, 0));
points1.push(new THREE.Vector3(0, (2 / 9) * Math.sqrt(3), 0));

const points2 = [];
points1.push(new THREE.Vector3(-(2 / 9) * Math.sqrt(3), 0, 0));
points1.push(new THREE.Vector3(0, -(2 / 9) * Math.sqrt(3), 0));

const points3 = [];
//The bow has vertical tangents at (+/-2/9sqrt(3),2/9) and horizontal tangents at (+/-1/4sqrt(2),1/4).
points3.push(new THREE.Vector3((1 / 4) * Math.sqrt(2), 1 / 4, 0));
points3.push(new THREE.Vector3(1 / 4, (1 / 4) * Math.sqrt(2), 0));

const points4 = [];
points4.push(new THREE.Vector3(-(1 / 4) * Math.sqrt(2), 0, 0));
points4.push(new THREE.Vector3(0, (-1 / 4) * Math.sqrt(2), 0));

// points.push(new THREE.Vector3(1, 0, 0));

const geometry1 = new THREE.BufferGeometry().setFromPoints(points1);
const geometry2 = new THREE.BufferGeometry().setFromPoints(points2);
const geometry3 = new THREE.BufferGeometry().setFromPoints(points3);
const line1 = new THREE.Line(geometry1, materialLine);
const line2 = new THREE.Line(geometry2, materialLine);
const line3 = new THREE.Line(geometry3, materialLine);
// scene.add(line1);
// scene.add(line2);
// scene.add(line3);

// #################### Create a BOW
const bowGroup = new THREE.Group();

// Define the control points of the curve that defines the shape of the bow
const curve = new THREE.CatmullRomCurve3([
	new THREE.Vector3(0, 0, 0),
	new THREE.Vector3(1, 0.5, 0),
	new THREE.Vector3(1.5, 0, 0),
	new THREE.Vector3(1, -0.5, 0),
	new THREE.Vector3(0, 0, 0),
]);

// Define the radius and number of segments of the tube geometry
const radius = 0.01;
const segments = 64;

// Create a tube geometry along the curve with the specified radius and segments
const tubeGeometry = new THREE.TubeGeometry(curve, segments, radius);

// Create a mesh from the tube geometry with a material
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const mesh = new THREE.Mesh(tubeGeometry, material);

// Mirror the curve by negating the x-coordinates of its control points
const mirroredPoints = [];
curve.points.forEach(function (point) {
	mirroredPoints.push(new THREE.Vector3(-point.x, point.y, point.z));
});
const mirroredCurve = new THREE.CatmullRomCurve3(mirroredPoints);

// Create a tube geometry along the mirrored curve with the specified radius and segments
const mirroredTubeGeometry = new THREE.TubeGeometry(mirroredCurve, segments, radius);

// Create a mesh from the mirrored tube geometry with a material
const mirroredMesh = new THREE.Mesh(mirroredTubeGeometry, material);

// Position the mirrored mesh to the right of the original mesh
mirroredMesh.position.x = 0;

const bowx = 2;
// Create a curve for the ribbon on the top of the bow
const ribbonCurveRight = new THREE.CatmullRomCurve3([
	new THREE.Vector3(0, -0.2 * bowx, 0),
	new THREE.Vector3(1 * bowx, -0.7 * bowx, 0),
	// new THREE.Vector3(1.5 * bowx, -0.5 * bowx, 0),
	// new THREE.Vector3(2 * bowx, -0.2 * bowx, 0),
]);

// Mirror the curve by negating the x-coordinates of its control points
const mirroredRibbonCurve = [];
ribbonCurveRight.points.forEach(function (point) {
	mirroredRibbonCurve.push(new THREE.Vector3(-point.x, point.y, point.z));
});
const mirroredRibbon = new THREE.CatmullRomCurve3(mirroredRibbonCurve);

// Create tube geometries along the ribbon curves with the specified radius and segments
const ribbonGeometryRight = new THREE.TubeGeometry(ribbonCurveRight, segments, radius * 0.5);
const ribbonGeometryLeft = new THREE.TubeGeometry(mirroredRibbon, segments, radius * 0.5);

// Create meshes from the ribbon geometries with the bow material
const ribbonMeshRight = new THREE.Mesh(ribbonGeometryRight, material);
const ribbonMeshLeft = new THREE.Mesh(ribbonGeometryLeft, material);

// Position the ribbon meshes relative to the bow mesh
ribbonMeshRight.position.x = 0.2 * bowx;
ribbonMeshLeft.position.x = -0.2 * bowx;
ribbonMeshRight.rotateOnAxis(new THREE.Vector3(0, 0, -1), Math.PI / 2);
ribbonMeshLeft.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);

// Add the ribbon meshes to the scene
bowGroup.add(ribbonMeshRight);
bowGroup.add(ribbonMeshLeft);
// scene.add(ribbonMeshRight);
// scene.add(ribbonMeshLeft);

// Add both meshes to the scene
bowGroup.add(mesh);
bowGroup.add(mirroredMesh);
// scene.add(mesh);
// scene.add(mirroredMesh);

const martisorGroup = new THREE.Group();
martisorGroup.add(bowGroup);
martisorGroup.add(heartGroup);

martisorGroup.position.set(0, 2, 0);

scene.add(martisorGroup);

gui.add(bowGroup.position, "x").min(-3).max(3).step(0.01).name("bowx");
gui.add(bowGroup.position, "y").min(-3).max(3).step(0.01).name("bowy");

// Sizes
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener("resize", () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.z = -3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
// Renderer
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */

const tick = () => {
	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
