import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";

const createHeart = (heartShape, extrudeSettings, heartMaterial, isLeft, scale, x, y, z, rX, rY, rZ) => {
	let geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
	let mesh = new THREE.Mesh(geometry, heartMaterial);
	mesh.scale.set(scale, scale, scale);

	if (isLeft) {
		mesh.position.set(x, y, z);
		mesh.rotation.set(rX, rY, rZ);
	} else {
		mesh.position.set(x, y, z);
		mesh.rotation.set(rX, rY, rZ);
	}

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
	heartGroup.position.set(1, -1.7, 0);

	const martisorGroup = new THREE.Group();
	martisorGroup.add(bow);
	martisorGroup.add(heartGroup);
	martisorGroup.position.set(0, 0, 0);

	return martisorGroup;
};

// Animate
const tick = (controls, renderer, scene, camera) => {
	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(() => tick(controls, renderer, scene, camera));
};

const main = () => {
	// Debug
	const gui = new dat.GUI();

	// Scene
	const scene = new THREE.Scene();

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
	const white = "#ffffff";
	const materialRed = new THREE.MeshBasicMaterial({
		color: white,
	});

	const heartRight = createHeart(
		heartShape,
		extrudeSettings,
		materialRed,
		false,
		0.01,
		0,
		0,
		0,
		0,
		0,
		Math.PI - Math.PI / 8
	);

	const heartLeft = createHeart(
		heartShape,
		extrudeSettings,
		materialRed,
		true,
		0.01,
		-1.66,
		-0.35,
		0,
		0,
		0,
		Math.PI + Math.PI / 7
	);

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
	camera.position.z = 3;
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

	tick(controls, renderer, scene, camera);
};

main();
