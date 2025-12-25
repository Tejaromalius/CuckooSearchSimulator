import { Landscape } from './base.js';
import { STATE, EVENTS } from '../config.js';

export class Sphere extends Landscape {
  constructor() {
    super('sphere');
  }

  f(x, z) {
    return x ** 2 + z ** 2;
  }

  get bounds() {
    return 10;
  }
  get hScale() {
    return 0.1;
  }
  get visOffset() {
    return 0;
  }
  get colors() {
    return [0x000000, 0x00ff00];
  } // Black to Green
  get analogy() {
    return 'A simple bowl. Any decent algorithm should roll straight to the bottom. Used as a baseline sanity check.';
  }
  get target() {
    return '(0, 0)';
  }

  getControlsHTML() {
    return `<div style="font-size: 0.8rem; color: #aaa; font-style: italic;">No parameters for Sphere function.</div>`;
  }

  updateParams(dom) {}
}
