import * as THREE from 'three';
import { STATE } from '../config.js';

export class PopulationManager {
  constructor(scene) {
    this.scene = scene;
    this.meshes = [];
    this.ghosts = []; // Array of arrays of ghost meshes
    this.maxGhosts = 5; // How many breadcrumbs to keep per particle

    // Geometry/Material cache
    this.geo = new THREE.SphereGeometry(0.12, 16, 16);
    this.ghostGeo = new THREE.SphereGeometry(0.08, 8, 8); // Smaller, lower poly for ghosts

    this.mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.ghostMatBase = new THREE.MeshBasicMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.4,
    });

    this.beacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0, 0.2, 4, 8),
      new THREE.MeshBasicMaterial({
        color: 0x00f260,
        opacity: 0.8,
        transparent: true,
      }),
    );
    this.scene.add(this.beacon);
    this.beacon.visible = false;
  }

  init(particles) {
    // Clear old particles
    this.meshes.forEach((m) => this.scene.remove(m));
    this.meshes = [];

    // Clear old ghosts
    this.ghosts.forEach((ghostList) => {
      ghostList.forEach((g) => this.scene.remove(g));
    });
    this.ghosts = [];

    // Init new
    particles.forEach((p) => {
      const m = new THREE.Mesh(this.geo, this.mat.clone());
      this.scene.add(m);
      this.meshes.push(m);
      this.ghosts.push([]); // Init empty ghost list for this particle
    });
  }

  update(particles, landscape, best) {
    const hScale = landscape.hScale;
    const off = landscape.visOffset;

    particles.forEach((p, i) => {
      if (!this.meshes[i]) return;
      const mesh = this.meshes[i];

      // Calculate new position
      const h = landscape.f(p.x, p.z);
      const newY = h * hScale + off + 0.1;

      // --- BREADCRUMB LOGIC ---
      // Only drop a breadcrumb if the position has changed significantly
      const distSq =
        (mesh.position.x - p.x) ** 2 + (mesh.position.z - p.z) ** 2;

      if (distSq > 0.001) {
        // Creates a ghost at the OLD position before moving
        const ghost = new THREE.Mesh(this.ghostGeo, this.ghostMatBase.clone());
        ghost.position.copy(mesh.position);
        this.scene.add(ghost);

        // Add to history
        const pGhosts = this.ghosts[i];
        pGhosts.push(ghost);

        // Trim excess ghosts
        if (pGhosts.length > this.maxGhosts) {
          const old = pGhosts.shift();
          this.scene.remove(old);
          old.geometry.dispose();
          old.material.dispose();
        }

        // Update opacities for fade effect
        pGhosts.forEach((g, index) => {
          // Newer = more opaque
          g.material.opacity = 0.1 + 0.3 * (index / pGhosts.length);
        });
      }

      // Move actual particle
      mesh.position.set(p.x, newY, p.z);
    });

    // Update Beacon
    if (best && best.val !== Infinity) {
      const by = best.val * hScale + off + 2;
      this.beacon.position.set(best.x, by, best.z);
      this.beacon.visible = true;
    } else {
      this.beacon.visible = false;
    }
  }
}
