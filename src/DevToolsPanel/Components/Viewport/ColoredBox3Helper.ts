import { Box3Helper, type Color, type LineBasicMaterial } from 'three';
import { extend, type Object3DNode } from '@react-three/fiber';

class ColoredBox3Helper extends Box3Helper {
    get color(): Color {
        return (this.material as LineBasicMaterial).color;
    }

    set color(value: Color) {
        (this.material as LineBasicMaterial).color = value;
    }

    public type = 'ColoredBox3Helper';
}

extend({ ColoredBox3Helper });

declare module '@react-three/fiber' {
    interface ThreeElements {
        coloredBox3Helper: Object3DNode<
            ColoredBox3Helper,
            typeof ColoredBox3Helper
        >;
    }
}
