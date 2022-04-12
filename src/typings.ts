
import * as THREE from 'three';

export type light = {
  type: THREE.Light,
  params: any[],
}

export type XYZ = [number, number, number];

export type Options = {
  container: string; // 容器
  model: {
    url: string; // 3d模型url
    position?: XYZ;
    loader?: typeof THREE.Loader;
  },
  background?: string|false; // 背景色
  onObjectLoaded?: () => void;
  lights?: light[];
  controls?: {
    autoRotate?: boolean; // 是否自主旋转
    interruptAutoRotate?: boolean; // 是否被鼠标移动时间打断
    resumeDuration?: number; // 打断后恢复时间
    options?: Record<string, any>; // 控制器配置
  };
  camera?: {
    positions?: XYZ;
    Camera?: typeof THREE.Camera; // 默认相机
    params?: any[]; // camera.Camera的构造参数
    customCamera?: THREE.Camera; // 自定义相机，如有定义会覆盖camera.Camera
  },
  interactive?: boolean|{
    event?: 'move'|'click'|string; // 交互出发事件
    resetBefore?: boolean; // 在交互效果产生之前，是否清除之前产生的效果
    resetWhenNonIntersects?: boolean; // 交互触发时无相交obj，是否清除
    resetBeforeWhenHasIntersects?: boolean; // 在某个obj上交互触发时， 如有上个交互效果，是否清除
    onInteractive?: boolean|((context: any, intersects: any) => void);  // 自定义交互逻辑
  },
  autoResize?: boolean; // 是否响应窗体大小改变
  box3Helper?: boolean|Record<string, any>;
  arrowHelper?: boolean|Record<string, any>;
  gridHelper?: boolean|Record<string, any>;
  pointLightHelper?: boolean|Record<string, any>;
  boxHelper?: boolean|Record<string, any>;
  helper?: boolean; // helper是所有辅助的总开关
}


