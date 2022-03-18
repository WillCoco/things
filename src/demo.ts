import Things from '.';
import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader';

const box = new Things({
  container: '#m',
  background: '#ccc',
  model: {
    url: './jichuang.3ds',
    loader: TDSLoader,
    position: [-100, 600, 0]
  },
  helper: true,
  boxHelper: false,
  arrowHelper: {
    length: 5
  },
  gridHelper: {
    divisions: 10,
    size: 10
  },
  pointLightHelper: true,
  camera: {
    positions: [0, 1000, 100],
    params:  [75, 100/20, 0.1, 100000]
  },
  controls: {
    autoRotate: true,
    interruptAutoRotate: false
  },
});
