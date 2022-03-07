import * as THREE from 'three';

// TODO: 除了hex颜色变化更多的交互配置
class Interactive {
  context;
  options;
  raycaster;
  currentInteractiveObj
  mouse;
  rect;

  constructor(context, options) {
    this.context = context;
    this.options = options;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.rect = context.containerDom.getBoundingClientRect();

    this.render()
    document.addEventListener(options.event || 'click', (e) => this.onEvent(e), false);
  }

  onEvent( event ) {
    // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1), rect.left\right 用于纠正scroll偏差
    this.mouse.x = ((event.clientX - this.rect.left) / (this.context.containerDom.clientWidth - this.rect.left)) * 2 - 1;
    this.mouse.y = - ((event.clientY - this.rect.top) / (this.context.containerDom.clientHeight - this.rect.top)) * 2 + 1;
    this.render();
  }

  clearLastModify = () => {
    this.currentInteractiveObj?.material?.emissive?.setHex(this.currentInteractiveObj.currentHex);
    this.currentInteractiveObj = null;
  }

  render() {
    // 通过摄像机和鼠标位置更新射线
    this.raycaster.setFromCamera(this.mouse, this.context.camera );

    // 计算物体和射线的焦点
    const intersects = this.raycaster.intersectObjects(this.context.scene.children);

    // 是否在下个交互改变前 重置
    if (this.options.resetBefore) {
      this.clearLastModify();
    }

    if (intersects.length > 0) {
      if (this.options.resetBeforeWhenHasIntersects) {
        this.clearLastModify();
      }
      const notHelp = !(intersects[0].object instanceof THREE.ArrowHelper) &&
        !(intersects[0].object instanceof THREE.GridHelper) &&
        !(intersects[0].object instanceof THREE.Box3Helper);

      if (notHelp) {
        // 执行交互效果
        this.options.onInteractive ? this.options.onInteractive(this, intersects) : this.defaultInteractive(this, intersects);
      } else if (this.options.resetWhenNonIntersects) {
        // 若配置resetWhenNonIntersects, 则在没有穿透模型时重置
        this.clearLastModify();
      }
    } else if (this.options.resetWhenNonIntersects) {
      // 若配置resetWhenNonIntersects, 则在没有穿透模型时重置
      this.clearLastModify();
    }

    this.context.render();
  }

  // 默认的交互效果
  defaultInteractive(context, intersects) {
    context.currentInteractiveObj = intersects[0].object;
    context.currentInteractiveObj.currentHex = context.currentInteractiveObj.material.emissive.getHex();
    context.currentInteractiveObj.material.emissive.setHex(context.options.activeHex || 0xff0000);
  }
}

export default Interactive;