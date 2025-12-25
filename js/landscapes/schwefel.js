import { Landscape } from './base.js';
import { STATE, EVENTS } from '../config.js';

export class Schwefel extends Landscape {
  constructor() {
    super('schwefel');
  }

  f(x, z) {
    const p = STATE.landscapeParams.schwefel;
    const freq = p.freq || 1.0;
    const term1 = x * Math.sin(Math.sqrt(Math.abs(x * freq)));
    const term2 = z * Math.sin(Math.sqrt(Math.abs(z * freq)));

    // Using scale from STATE as the vertical constant
    return p.scale * 2 - (term1 + term2);
  }

  get bounds() {
    return 500;
  }
  get hScale() {
    return 0.08;
  }
  get visOffset() {
    return 10;
  }
  get colors() {
    return [0xff0000, 0xffcccc];
  } // Crimson to Light Red
  get analogy() {
    return 'A deceptive landscape. The global minimum is far at the edge, deep in a valley, while other deep valleys exist far away.';
  }
  get target() {
    return '(420.97, 420.97)';
  }

  getControlsHTML() {
    const p = STATE.landscapeParams.schwefel;
    return `
            <div class="sub-control">
                <label>Vertical Offset: <span id="val-schwefel-scale">${p.scale.toFixed(0)}</span></label>
                <input type="range" id="inp-schwefel-scale" min="200" max="600" step="10" value="${p.scale}">
            </div>
            <div class="sub-control">
                <label>Frequency (Waviness): <span id="val-schwefel-freq">${(p.freq || 1.0).toFixed(2)}</span></label>
                <input type="range" id="inp-schwefel-freq" min="0.5" max="2.0" step="0.05" value="${p.freq || 1.0}">
            </div>
        `;
  }

  updateParams(dom) {
    const p = STATE.landscapeParams.schwefel;
    const domScale = dom.querySelector('#inp-schwefel-scale');
    const domFreq = dom.querySelector('#inp-schwefel-freq');

    if (domScale) {
      domScale.addEventListener('input', (e) => {
        p.scale = parseFloat(e.target.value);
        dom.querySelector('#val-schwefel-scale').innerText = p.scale.toFixed(0);
        document.dispatchEvent(new Event(EVENTS.UPDATE_PARAMS));
      });
    }
    if (domFreq) {
      domFreq.addEventListener('input', (e) => {
        p.freq = parseFloat(e.target.value);
        dom.querySelector('#val-schwefel-freq').innerText = p.freq.toFixed(2);
        document.dispatchEvent(new Event(EVENTS.UPDATE_PARAMS));
      });
    }
  }
}
