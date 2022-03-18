import * as THREE from 'three';
// import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Interactive from './interactive';
import Statistics from './statistics';
import throttle from './utils/throttle'
import {Options} from './typings';

type XYZ = [number, number, number];

/* 初始化配置 */
class ThingsBox {

  container;

  containerDom;

  containerWidth;

  containerHeight;

  scene: THREE.Scene;

  finalOptions;

  camera;

  renderer: THREE.WebGLRenderer;

  controls;

  statisticsPanel; // 统计面板

  interactive; // 交互行为

  autoAnim: boolean; // 是否在进行自主动画

  lights;

  private regainAutoRotateTimer; // 恢复自主动画定时器

  DEFAULT_OPTIONS;
  
  constructor(options: Options) {
    this.container = options.container;
    
    this.containerDom = document.querySelector(this.container);
    if (!this.containerDom) throw new Error('请指定container');
    this.containerWidth = this.containerDom.clientWidth;
    this.containerHeight = this.containerDom.clientHeight;

    this.DEFAULT_OPTIONS = {
      background: 'rgb(255, 255, 255)',
      onObjectLoaded: undefined,
      lights: [{
        type: THREE.PointLight,
        params: [0xffffff, 1],
        positions: [500, 600, 400]
      },
      {
        type: THREE.AmbientLight,
        params: [0x404040],
      }],
      controls: {
        autoRotate: true,
        interruptAutoRotate: true, // 是否被鼠标移动时间打断
        resumeDuration: 5000, // 打断后恢复时间
        options: {
          enableDamping: true, // an animation loop is required when either damping or auto-rotation are enabled
          dampingFactor: 0.05,
          screenSpacePanning: false,
          minDistance: 0,
          maxDistance: 1000,
          enablePan: false
        }
      },
      camera: {
        positions: [500, 600, 400],
        Camera: THREE.PerspectiveCamera,
        params:  [75, 0.1, 1000],
        customCamera: undefined,
      },
      model: {
        url: '',
        position: [0, 0, 0],
        loader: GLTFLoader
      },
      interactive: {
        event: 'click', // 交互出发事件
        resetBefore: true, // 在交互效果产生之前，是否清除之前产生的效果
        resetWhenNonIntersects: true, // 交互触发时无相交obj，是否清除
        resetBeforeWhenHasIntersects: true, // 在某个obj上交互触发时， 如有上个交互效果，是否清除
        onInteractive: false,  // 自定义交互逻辑
      },
      autoResize: true,
      box3Helper: false,
      arrowHelper: false,
      gridHelper: false,
      pointLightHelper: false,
      helper: false, // helper是所有辅助的总开关
    }

    const finalOptions = {
      ...this.DEFAULT_OPTIONS, ...options,
      camera: {...this.DEFAULT_OPTIONS.camera, ...options.camera||{}},
      controls: {...this.DEFAULT_OPTIONS.controls, ...options.controls||{}},
      model: {...this.DEFAULT_OPTIONS.model, ...options.model||{}},
      interactive: options.interactive === false ? false : {...this.DEFAULT_OPTIONS.interactive, ...options.interactive||{}},
      lights: [...this.DEFAULT_OPTIONS.lights, ...options.lights||[]],
    };

    this.finalOptions = finalOptions;

    this.init();
  }


  // init
  init() {
    const {controls} = this.finalOptions;

    this.scene = new THREE.Scene(); // 创建场景
    this.scene.background = new THREE.Color(this.finalOptions.background); // 设置场景背景

    this.renderer = new THREE.WebGLRenderer({antialias:true, alpha: true});
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.containerWidth, this.containerHeight);
    this.containerDom.appendChild(this.renderer.domElement);

    // 添加相机
    this.addCamera();

    // 添加光源
    this.addLights();

    // 轨道控制
    this.addControls();

    // 加载模型
    this.load()
      .then((res) => {
        console.log('加载完成', res)
      });

    // 鼠标在模型上操作的交互
    this.interactive = new Interactive(this, this.finalOptions.interactive);

    // 辅助
    this.helper();

    // 统计信息
    this.statistics();

    //
    this.animate();

    // 自主旋转
    this.autoRotate();

    // 画布自适应
    this.sizeAdaptive()
  }

  load() {
    const loader = new this.finalOptions.model.loader;
    return new Promise((resolve) => {
      loader.load(this.finalOptions.model.url, (o: any) => {

        let finalObj;

        if (this.finalOptions.onObjectLoaded) {
          finalObj = this.finalOptions.onObjectLoaded()
        } else {
          finalObj = o.scene || o;
          finalObj.position.set(...(this.finalOptions.model.position as XYZ));

          // finalObj.traverse( function(child) {
          //   if (child instanceof THREE.Mesh) {

          //     // apply custom material
          //     child.material.side = (THREE.DoubleSide);

          //     // enable casting shadows
          //     child.castShadow = true;
          //     child.receiveShadow = true;
          //     }
          // });
          finalObj.traverse(function (child) {
            if (child.isMesh) {
              child.frustumCulled = false;
            }
          });

          this.scene.add(finalObj);
        }
        this.render();
        resolve(finalObj);
      }, undefined, function ( error ) {
        console.error( error );
      });
    })
  }

  addControls() {
    const {controls} = this.finalOptions;
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    if (controls?.options) {
      Object.entries(controls.options).map(([key, value]) => {
        this.controls[key] = value;
      })
    }
    this.controls.autoRotate = controls.autoRotate || controls?.options?.autoRotate;
  }

  animate() {
    const {controls} = this.finalOptions;
    this.render();
    requestAnimationFrame(() => this.animate());

    if (!controls.autoRotate) return;

    this.controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
  }

  autoRotate() {
    const {camera, controls} = this.finalOptions;
    // 停止光标移动[resumeDuration]时间后恢复旋转
    const onMouseOut = ():void => {
      if (controls.interruptAutoRotate) return;
      this.controls.autoRotate = false;
      if (this.regainAutoRotateTimer) {
        clearTimeout(this.regainAutoRotateTimer)
      }
      this.regainAutoRotateTimer = setTimeout(() => {
        this.controls.autoRotate = true;
        this.camera.position.set(...(camera.positions as XYZ));
      }, controls.resumeDuration);
    }

    this.containerDom.removeEventListener('mousemove', throttle(onMouseOut.bind(this), 100), false)
    this.containerDom.removeEventListener('mouseout', throttle(onMouseOut.bind(this), 100), false)
    this.containerDom.addEventListener('mousemove', throttle(onMouseOut.bind(this), 100), false)
    this.containerDom.addEventListener('mouseout', throttle(onMouseOut.bind(this), 100), false)
  }

  addCamera() {
    const {camera} = this.finalOptions;
    // xxx new 构造函数的扩展运算符
    function produceCamera (...rest) {
      return new camera.Camera(rest[0], rest[1], rest[2], rest[3], rest[4], rest[5], rest[6], rest[7], rest[8], rest[9]);
    }
    const newCamera = produceCamera.apply(this, camera.params);
    this.camera = camera.customCamera || newCamera;

    this.camera.position.set(...(camera.positions as XYZ));
    this.camera.lookAt(0, 0, 0);
  }

  addLights() {
    const {lights} = this.finalOptions;
      this.lights = lights.map((light) => {
        const lightParams = light?.params || [];

        // xxx new 构造函数的扩展运算符
        function produceLight(...rest) {
          return new light.type(rest[0], rest[1], rest[2], rest[3], rest[4], rest[5], rest[6], rest[7], rest[8], rest[9])
        }

        const l = produceLight.apply(this, lightParams);

        if (light.positions) {
          l.position.set(...light.positions)
        }

        this.scene.add(l);
        return l;
      })
  }

  sizeAdaptive() {
    const {autoResize} = this.finalOptions;
    if (!autoResize) return;
    const resize = () => {
      this.containerWidth = this.containerDom.clientWidth;
      this.containerHeight = this.containerDom.clientHeight;
      this.renderer.setSize(this.containerWidth, this.containerHeight);
    }
    window.addEventListener('resize', resize)
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  helper() {
    if (this.finalOptions.helper) {
      this.finalOptions.arrowHelper = this.finalOptions.arrowHelper || true;
      this.finalOptions.gridHelper = this.finalOptions.gridHelper || true;
      this.finalOptions.box3Helper = this.finalOptions.box3Helper || true;
      this.finalOptions.pointLightHelper = this.finalOptions.pointLightHelper || true;
    }
    if (this.finalOptions.arrowHelper) {
      const dirs = [
        new THREE.Vector3( 5, 0, 0 ),
        new THREE.Vector3( 0, 5, 0 ),
        new THREE.Vector3( 0, 0, 5 ),
      ];
      const colors = this.finalOptions.arrowHelper.colors || [0xff0000, 0xffff00, 0x0000ff]
      const origin = new THREE.Vector3( 0, 0, 0 );
      const length = this.finalOptions.arrowHelper.length || 1;
      dirs.forEach((dir, index) => {
        dir.normalize();
        const arrowHelperX = new THREE.ArrowHelper( dir, origin, length, colors[index] );
        this.scene.add( arrowHelperX );
      })
    }

    // 网格辅助
    if (this.finalOptions.gridHelper) {
      var gridHelperSize = this.finalOptions.gridHelper.size || 40;
      var gridHelperDivisions = this.finalOptions.gridHelper.divisions || 10;
      var gridHelper = new THREE.GridHelper( gridHelperSize, gridHelperDivisions );
      this.scene.add(gridHelper);
    }
    
    if (this.finalOptions.box3Helper) {
      const box3 = new THREE.Box3();
      box3.setFromCenterAndSize(new THREE.Vector3( 1, 1, 1 ), new THREE.Vector3( 2, 1, 3 ));
      const helper = new THREE.Box3Helper( box3, new THREE.Color(0xffff00) );
      this.scene.add( helper );
    }

    // 相机视锥体辅助
    // const cameraHelper = new THREE.CameraHelper( this.camera );
    // console.log(cameraHelper.pointMap, 'pointMap')
    // this.scene.add( cameraHelper );
    
    // 骨架辅助线
    // var helper = new THREE.SkeletonHelper( mesh );
    // helper.material.linewidth = 3;
    // this.scene.add( helper );

    // 盒辅助
    // if (this.finalOptions.boxHelper) {
    //   const sphere = new THREE.SphereGeometry();
    //   const object = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial(this.finalOptions.boxHelper));
    //   const box = new THREE.BoxHelper(object);
    //   this.scene.add(box);
    // }

    // var light = new THREE.AmbientLight( 0x404040 ); // soft white light
    // this.scene.add( light );

    // if (this.finalOptions.pointLightHelper) {
    //   this.lights.forEach((light) => {
    //     const isPointerLight = light instanceof THREE.PointLight;
    //     if (isPointerLight) {
    //       const sphereSize = this.finalOptions.pointLightHelper.sphereSize || 10;
    //       const hex = this.finalOptions.pointLightHelper.hex || 0xff0000;
    //       const pointLightHelper = new THREE.PointLightHelper(light, sphereSize, hex);
    //       this.scene.add(pointLightHelper);
    //     }
    //   })
    // }
  }

  statistics() {
    if (this.finalOptions.statistics) {
      this.statisticsPanel = new Statistics(this.finalOptions.statistics);
    }
  }
}

export default ThingsBox;