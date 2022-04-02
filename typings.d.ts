import * as THREE from 'three';

declare type light = {
    type: THREE.Light;
    params: any[];
};
declare type XYZ = [number, number, number];
declare type Options = {
    container: string;
    model: {
        url: string;
        position?: XYZ;
        loader?: typeof THREE.Loader;
    };
    background?: string;
    onObjectLoaded?: () => void;
    lights?: light[];
    controls?: {
        autoRotate?: boolean;
        interruptAutoRotate?: boolean;
        resumeDuration?: number;
        options?: Record<string, any>;
    };
    camera?: {
        positions?: XYZ;
        Camera?: typeof THREE.Camera;
        params?: any[];
        customCamera?: THREE.Camera;
    };
    interactive?: boolean | {
        event?: 'move' | 'click' | string;
        resetBefore?: boolean;
        resetWhenNonIntersects?: boolean;
        resetBeforeWhenHasIntersects?: boolean;
        onInteractive?: boolean | ((context: any, intersects: any) => void);
    };
    autoResize?: boolean;
    box3Helper?: boolean | Record<string, any>;
    arrowHelper?: boolean | Record<string, any>;
    gridHelper?: boolean | Record<string, any>;
    pointLightHelper?: boolean | Record<string, any>;
    boxHelper?: boolean | Record<string, any>;
    helper?: boolean;
};

type Types_light = light;
type Types_XYZ = XYZ;
type Types_Options = Options;
declare namespace Types {
  export {
    Types_light as light,
    Types_XYZ as XYZ,
    Types_Options as Options,
  };
}

declare class ThingsBox {
    static Types: typeof Types;
    container: any;
    containerDom: any;
    containerWidth: any;
    containerHeight: any;
    scene: THREE.Scene;
    private finalOptions;
    camera: any;
    renderer: THREE.WebGLRenderer;
    controls: any;
    statisticsPanel: any;
    interactive: any;
    autoAnim: boolean;
    lights: any;
    private throttledMouseEvent;
    private regainAutoRotateTimer;
    private DEFAULT_OPTIONS;
    constructor(options: Options);
    init(): void;
    load(): Promise<unknown>;
    addControls(): void;
    animate(): void;
    onMouseEvent(): void;
    autoRotate(): void;
    addCamera(): void;
    addLights(): void;
    sizeAdaptive(): void;
    render(): void;
    destroy(): void;
    helper(): void;
    statistics(): void;
}

export { ThingsBox as default };
