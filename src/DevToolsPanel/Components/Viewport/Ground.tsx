import { type JSX } from 'react';
import { Grid } from '@react-three/drei';

export function Ground(props: {
    center: readonly [number, number, number];
    width: number;
    height: number;
}): JSX.Element {
    const { center, width, height } = props;
    const gridConfig = {
        cellSize: 0.5,
        cellThickness: 0.5,
        cellColor: '#6f6f6f',
        sectionSize: 3,
        sectionThickness: 1,
        sectionColor: '#9d4b4b',
        fadeStrength: 0,
        followCamera: false,
        infiniteGrid: false,
        position: center,
    };
    return <Grid {...gridConfig} args={[width, height, 1, 1]} />;
}
