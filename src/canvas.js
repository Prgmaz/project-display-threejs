import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import { createNoise4D } from "simplex-noise";

class Canvas {
	constructor(data) {
		this.noise = createNoise4D();
		this.clock = new THREE.Clock();
		this.loadingManager = new THREE.LoadingManager(() => {
			console.log("Loaded");
		});
		this.data = data;
		this.scene = new THREE.Scene();
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
		});
		this.camera = new THREE.PerspectiveCamera(
			45,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);

		this.ambientLight = new THREE.AmbientLight("white");
		this.pointLight = new THREE.PointLight("white");
		this.objects = [];
		this.index = 0;
		this.count = 0;

		this.init();
	}

	init(posX = window.innerWidth / 700, posY = 6) {
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setClearColor("white", 0);
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.outputEncoding = THREE.sRGBEncoding;
		this.camera.position.z = 10;
		this.pointLight.position.set(10, 10, 10);

		document.body.appendChild(this.renderer.domElement);

		this.scene.add(this.ambientLight);
		this.scene.add(this.pointLight);

		window.addEventListener("resize", this.resize.bind(this));
		this.animate();

		const projects = document.getElementById("projects");
		const loader = new THREE.TextureLoader(this.loadingManager);

		for (const i in this.data) {
			const e = document.createElement("div");
			e.innerText = this.data[i].text;

			const geo = new THREE.PlaneGeometry(6.4, 4.8, 32, 32);
			const mat = new THREE.MeshBasicMaterial({
				color: 0xffffff,
			});
			const mesh = new THREE.Mesh(geo, mat);

			mesh.position.y = -i * posY;
			mesh.position.x = posX;
			mesh.rotation.y = -Math.PI / 6;

			this.objects.push(mesh);
			this.scene.add(mesh);
			if (i == 0) {
				mesh.scale.set(1.25, 1.25, 1.25);
			}

			loader.load(this.data[i].url, (tex) => {
				mesh.material.map = tex;
				mesh.material.needsUpdate = true;
			});

			e.addEventListener("click", () => {
				for (const i of projects.children) {
					i.classList.remove("active");
				}
				e.scrollIntoView();
				e.classList.add("active");
				this.moveCameraToArt(parseInt(i));
			});
			projects.appendChild(e);
		}
		projects.children.item(0).classList.add("active");
	}

	updatePlane() {
		const geo = new THREE.PlaneGeometry(6.4, 4.8, 32, 32);
		const mat = new THREE.MeshBasicMaterial({
			color: 0xffffff,
		});
		const mesh = new THREE.Mesh(geo, mat);
		const pos = mesh.geometry.attributes["position"];

		var plane = this.objects[this.index];

		if (plane) {
			const position = plane.geometry.attributes["position"];

			for (let i = 0; i < position.count; i++) {
				var z = i + (this.count * 0.1) / 100000;
				position.setZ(i, this.noise(z, z, z, z) * 0.1);
				// position.setX(i, this.noise(z, z, z, z));
				this.count += 1;
			}

			position.needsUpdate = true;
		}
	}

	moveCameraToArt(index, height = 6) {
		new TWEEN.Tween(this.camera.position)
			.to({ y: -index * height }, 200)
			.easing(TWEEN.Easing.Sinusoidal.InOut)
			.onStart(() => {
				new TWEEN.Tween(this.objects[this.index].scale)
					.to(
						{
							x: 1,
							y: 1,
							z: 1,
						},
						500
					)
					.easing(TWEEN.Easing.Sinusoidal.InOut)
					.start();
				new TWEEN.Tween(this.objects[index].scale)
					.to(
						{
							x: 1.25,
							y: 1.25,
							z: 1.25,
						},
						500
					)
					.easing(TWEEN.Easing.Sinusoidal.InOut)
					.start();
				this.index = index;
			})
			.start();
	}

	resize() {
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
	}

	animate() {
		this.updatePlane();

		TWEEN.update();
		this.renderer.render(this.scene, this.camera);
		window.requestAnimationFrame(this.animate.bind(this));
	}
}

export default Canvas;
