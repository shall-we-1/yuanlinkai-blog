declare module "canvas-nest.js" {
  type CanvasNestConfig = {
    color?: string;
    pointColor?: string;
    opacity?: number;
    count?: number;
    zIndex?: number;
  };

  export default class CanvasNest {
    constructor(element: Element, config?: CanvasNestConfig);
    destroy(): void;
  }
}
