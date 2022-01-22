import * as THREE from 'three';
import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const DEFAULT_OPTIONS = {
  background: 'rgb(255, 255, 255)',
  box3Helper: false,
  arrowHelper: false,
  gridHelper: false,
  helper: false, // helper是所有辅助的总开关
}

/* 初始化配置 */
class ThingsBox {

  container = '';

  containerWidth;
  containerHeight;

  scene: THREE.Scene;

  finalOptions;

  camera;

  renderer: THREE.WebGLRenderer;

  model;

  controls;

  loader = TDSLoader;
  
  constructor(options) {
    const finalOptions = {...DEFAULT_OPTIONS, ...options};
    this.finalOptions = finalOptions;
    this.container = finalOptions.container;
    this.model = finalOptions.model;

    this.init();
  }

  // init
  init() {
    const box = document.querySelector(this.container);
    if (!box) throw new Error('请指定container');
    this.containerWidth = box.clientWidth;
    this.containerHeight = box.clientHeight;

    this.scene = new THREE.Scene(); // 创建场景
    this.scene.background = new THREE.Color(this.finalOptions.background); // 设置场景背景

    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    this.camera.position.set(0, 0, 5);

    this.renderer = new THREE.WebGLRenderer({antialias:true, alpha: true});
    this.renderer.setSize(this.containerWidth, this.containerHeight);
    box.appendChild(this.renderer.domElement);

    // 轨道控制
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 0;
    this.controls.maxDistance = 500;

    // 加载模型
    this.load();

    this.animate();

    // 辅助
    this.helper();
  }

  load() {
    const loader = new this.loader();
    // loader.setResourcePath( 'models/3ds/portalgun/textures/' );
    loader.load(this.model, ( object ) => {
      console.log('obj', object, this.model)
      // object.traverse( function ( child ) {
      //   // if ( child.isMesh ) {
      //   //   child.material.specular.setScalar( 0.1 );
      //   //   child.material.normalMap = normal;
      //   // }
      // });

    //   var geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
    //   var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );

    //   var cubeA = new THREE.Mesh( geometry, material );
    //   cubeA.position.set( 0, 0, 5 );

    //   var cubeB = new THREE.Mesh( geometry, material );
    //   cubeB.position.set( 0, -0, -5 );

    // //create a group and add the two cubes
    // //These cubes can now be rotated / scaled etc as a group
    //   var group = new THREE.Group();
    //   group.add( cubeA );
    //   group.add( cubeB );
      // this.scene.add( group );

      this.scene.add(object);

      this.render();
    }, function(e) {
      console.log(e)
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
    this.render();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  helper() {
    if (this.finalOptions.helper) {
      this.finalOptions.arrowHelper = this.finalOptions.arrowHelper || true;
      this.finalOptions.gridHelper = this.finalOptions.arrowHelper || true;
      this.finalOptions.box3Helper = this.finalOptions.box3Helper || true;
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
  }
}

export default ThingsBox;