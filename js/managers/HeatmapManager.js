import * as THREE from 'three';
import { STATE } from '../config.js';

export class HeatmapManager {
  constructor(scene) {
    this.scene = scene;
    this.gridSize = 128; // Resolution
    this.grid = new Float32Array(this.gridSize * this.gridSize);
    this.mesh = null;
    this.texture = null;
    this.maxVisits = 1;
    this.enabled = false;
  }

  reset() {
    this.grid.fill(0);
    this.maxVisits = 1;
    if (this.texture) this.texture.needsUpdate = true;
  }

  setEnabled(enabled, landscape) {
    this.enabled = enabled;
    if (enabled) {
      this.buildMesh(landscape);
    } else {
      if (this.mesh) {
        this.scene.remove(this.mesh);
        this.mesh = null;
      }
    }
  }

  buildMesh(landscape) {
    if (this.mesh) this.scene.remove(this.mesh);

    const size = landscape.bounds * 2;
    const geo = new THREE.PlaneGeometry(size, size);

    // Data Texture
    this.texture = new THREE.DataTexture(
      new Uint8Array(this.gridSize * this.gridSize * 4),
      this.gridSize,
      this.gridSize
    );
    this.texture.format = THREE.RGBAFormat;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.needsUpdate = true;

    const mat = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      opacity: 0.6,
      depthTest: false, // Always show on top slightly
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.rotation.x = -Math.PI / 2;
    // Lift slightly above terrain
    this.mesh.position.y = landscape.visOffset + (landscape.hScale * 10) + 0.5;

    if (this.enabled) this.scene.add(this.mesh);
  }

  update(particles, landscape) {
    if (!this.enabled) return;

    const b = landscape.bounds;
    let changed = false;

    particles.forEach(p => {
      // Map (x,z) [-b, b] to [0, gridSize]
      // u = (x + b) / (2b)
      const u = (p.x + b) / (2 * b);
      const v = (p.z + b) / (2 * b);

      if (u >= 0 && u < 1 && v >= 0 && v < 1) {
        const cx = Math.floor(u * this.gridSize);
        const cy = Math.floor(v * this.gridSize);
        const idx = cy * this.gridSize + cx;
        this.grid[idx] += 1;
        if (this.grid[idx] > this.maxVisits) this.maxVisits = this.grid[idx];
        changed = true;
      }
    });

    if (changed && this.texture) {
      this.updateTexture();
    }
  }

  updateTexture() {
    const data = this.texture.image.data;
    for (let i = 0; i < this.grid.length; i++) {
      const val = this.grid[i];
      if (val > 0) {
        // Healmap coloration: Cold to Hot
        // Log scale for better visibility of trails vs hotspots
        const intensity = Math.log(val + 1) / Math.log(this.maxVisits + 1);

        // Simple Heatmap Gradient: Blue -> Green -> Red
        const r = Math.min(1, intensity * 2) * 255;
        const g = (1 - Math.abs(intensity - 0.5) * 2) * 255;
        const b = Math.max(0, (1 - intensity * 2)) * 255;
        const a = Math.min(0.8, intensity + 0.2) * 255;

        const stride = i * 4;
        data[stride] = r;
        data[stride + 1] = g;
        data[stride + 2] = b;
        data[stride + 3] = a;
      } else {
        const stride = i * 4;
        data[stride + 3] = 0; // Transparent
      }
    }
    this.texture.needsUpdate = true;
  }
}
