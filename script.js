import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";

const white = "#ffffff";
const red = "#ff0000";

const randomNumber = (min, max) => {
	return Math.floor(Math.random() * (max - min + 1) + min);
};

const createRedMaterial = () => {
	const material = new THREE.MeshBasicMaterial({
		color: "#" + Math.floor(randomNumber(128, 192)).toString(16) + "0000",
	});
	return material;
};

const materials = [...Array(10)].map(() => createRedMaterial());

const createHeart = (heartShape, extrudeSettings, isLeft, scale) => {
	let geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
	let mesh = new THREE.Mesh(
		geometry,
		new THREE.MeshBasicMaterial({
			color: white,
		})
	);

	if (isLeft) {
		mesh = new THREE.Mesh(geometry, materials[Math.floor(Math.random() * materials.length)]);
		mesh.position.set(-1.67, -0.35, 0);
		mesh.rotation.set(0, 0, Math.PI + Math.PI / 7);
	} else {
		mesh.position.set(0, 0, 0);
		mesh.rotation.set(0, 0, Math.PI - Math.PI / 8);
	}

	mesh.scale.set(scale, scale, scale);

	return mesh;
};

const createBow = (loopCurve, ribbonCurve, material, radius, segments) => {
	const bowGroup = new THREE.Group();

	// Create a tube geometry along the curve with the specified radius and segments
	const loopGeometryRight = new THREE.TubeGeometry(loopCurve, segments, radius);

	// Create a mesh from the tube geometry with a material
	// const materialBow = new THREE.MeshBasicMaterial({ color: 0xff0000 });
	const meshLoopRight = new THREE.Mesh(loopGeometryRight, material);

	// Mirror the curve by negating the x-coordinates of its control points for the left bow
	const mirroredPoints = [];
	loopCurve.points.forEach((point) => {
		mirroredPoints.push(new THREE.Vector3(-point.x, point.y, point.z));
	});
	const mirroredCurve = new THREE.CatmullRomCurve3(mirroredPoints);

	// Create a tube geometry along the mirrored curve with the specified radius and segments
	const loopGeometryLeft = new THREE.TubeGeometry(mirroredCurve, segments, radius);

	// Create a mesh from the mirrored tube geometry with a material
	const meshLoopLeft = new THREE.Mesh(loopGeometryLeft, material);

	// Mirror the curve by negating the x-coordinates of its control points
	const mirroredRibbonCurve = [];
	ribbonCurve.points.forEach((point) => {
		if (point.x != 0) {
			mirroredRibbonCurve.push(new THREE.Vector3(-point.x + 0.3, point.y - 0.3, point.z));
		} else {
			mirroredRibbonCurve.push(new THREE.Vector3(point.x, point.y, point.z));
		}
	});
	const mirroredRibbon = new THREE.CatmullRomCurve3(mirroredRibbonCurve);

	// Create tube geometries along the ribbon curves with the specified radius and segments
	const ribbonGeometryRight = new THREE.TubeGeometry(ribbonCurve, segments, radius * 0.5);
	const ribbonGeometryLeft = new THREE.TubeGeometry(mirroredRibbon, segments, radius * 0.5);
	// Create meshes from the ribbon geometries with the bow material
	const ribbonMeshRight = new THREE.Mesh(ribbonGeometryRight, material);
	const ribbonMeshLeft = new THREE.Mesh(ribbonGeometryLeft, material);

	bowGroup.add(meshLoopRight);
	bowGroup.add(meshLoopLeft);
	bowGroup.add(ribbonMeshRight);
	bowGroup.add(ribbonMeshLeft);

	return bowGroup;
};

const createMartisor = (bow, heartLeft, heartRight) => {
	const heartGroup = new THREE.Group();
	heartGroup.add(heartLeft);
	heartGroup.add(heartRight);
	heartGroup.position.set(1, -1.65, -0.02);

	const martisorGroup = new THREE.Group();
	martisorGroup.add(bow);
	martisorGroup.add(heartGroup);
	martisorGroup.position.set(0, 0, 0);

	return martisorGroup;
};

const spawnMartisoare = (martisor, scene, count) => {
	const martisoare = [];

	for (let i = 0; i < count * 3; i++) {
		const martisorClone = martisor.clone();
		let x = (Math.random() - 0.5) * 100;
		let y = (Math.random() - 0.5) * 100;
		let z = (Math.random() - 0.5) * 50;
		martisorClone.position.set(x, y, z);
		martisorClone.rotation.set(0, (Math.random() * Math.PI) / 6, (Math.random() * Math.PI) / 4);
		scene.add(martisorClone);

		martisoare.push({
			shape: martisorClone,
			x: Math.random(),
			y: Math.random(),
			z: Math.random(),
		});
	}

	return martisoare;
};

// Animate
const tick = (controls, renderer, scene, camera, martisoare) => {
	// Update controls
	controls.update();

	const speed = 0.01;
	martisoare.forEach((el) => {
		el.shape.rotation.x += el.x * speed;
		el.shape.rotation.y += el.y * 1.5 * speed;
		el.shape.rotation.z += el.z * 2.5 * speed;
	});

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(() => tick(controls, renderer, scene, camera, martisoare));
};

const main = () => {
	// Debug
	const gui = new dat.GUI();

	// Scene
	const scene = new THREE.Scene();
	scene.background = new THREE.Color("#c6adcd");
	// gui.add(scene.background, "r").min(0).max(1).step(0.001);
	gui.addColor(scene, "background");
	// gui.addFolder("Materials");
	// materials.forEach((material, index) => {
	// 	gui.addColor(material, "color").name(`Material ${index}`);
	// });

	// Canvas
	const canvas = document.querySelector("canvas.webgl");

	// Heart Object
	const heartX = -25;
	const heartY = -25;
	const heartShape = new THREE.Shape();
	heartShape.moveTo(25 + heartX, 25 + heartY);
	heartShape.bezierCurveTo(25 + heartX, 25 + heartY, 20 + heartX, 0 + heartY, 0 + heartX, 0 + heartY);
	heartShape.bezierCurveTo(-30 + heartX, 0 + heartY, -30 + heartX, 35 + heartY, -30 + heartX, 35 + heartY);
	heartShape.bezierCurveTo(-30 + heartX, 55 + heartY, -10 + heartX, 77 + heartY, 25 + heartX, 95 + heartY);
	heartShape.bezierCurveTo(60 + heartX, 77 + heartY, 80 + heartX, 55 + heartY, 80 + heartX, 35 + heartY);
	heartShape.bezierCurveTo(80 + heartX, 35 + heartY, 80 + heartX, 0 + heartY, 50 + heartX, 0 + heartY);
	heartShape.bezierCurveTo(35 + heartX, 0 + heartY, 25 + heartX, 25 + heartY, 25 + heartX, 25 + heartY);

	const extrudeSettings = {
		// amount: 10,
		depth: 8,
		bevelEnabled: true,
		bevelSegments: 2,
		steps: 2,
		bevelSize: 1,
		bevelThickness: 1,
	};

	const heartRight = createHeart(heartShape, extrudeSettings, false, 0.01);
	const heartLeft = createHeart(heartShape, extrudeSettings, true, 0.01);

	// Define the control points of the curve that defines the shape of the bow
	const loopCurve = new THREE.CatmullRomCurve3([
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(1, 0.5, 0),
		new THREE.Vector3(1.5, 0, 0),
		new THREE.Vector3(1, -0.5, 0),
		new THREE.Vector3(0, 0, 0),
	]);

	// Define the radius and number of segments of the tube geometry
	const radius = 0.03;
	const segments = 64;

	// Create a mesh from the tube geometry with a material
	const materialBow = new THREE.MeshBasicMaterial({ color: 0xff0000 });

	const ribbonCurve = new THREE.CatmullRomCurve3([
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(1, -1.5, 0),
		new THREE.Vector3(1, -1.7, 0),
		// new THREE.Vector3(2 * bowx, -0.2 * bowx, 0),
	]);

	const bowGroup = createBow(loopCurve, ribbonCurve, materialBow, radius, segments);
	// scene.add(bowGroup);

	const martisor = createMartisor(bowGroup, heartRight, heartLeft);
	scene.add(martisor);

	const martisoare = spawnMartisoare(martisor, scene, 200);

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
	// Camera
	const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
	camera.position.z = 30;
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

	tick(controls, renderer, scene, camera, martisoare);
};

main();
