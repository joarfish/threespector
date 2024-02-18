import { type JSX } from 'react';
import { Grid } from '@react-three/drei';
import { useStore } from 'zustand';
import { applicationStore } from '../../Store';
import { orientationToVector3 } from '../../Lib/Orientation';

export function Ground(props: {
    center: readonly [number, number, number];
    width: number;
    height: number;
}): JSX.Element {
    const { center, width, height } = props;
    const upVector = useStore(applicationStore, state =>
        orientationToVector3(state.orientation),
    );

    const cellSize = Math.min(width, height) / 100;
    const sectionSize = cellSize * 6;

    const gridConfig = {
        cellSize,
        cellThickness: 0.5,
        cellColor: '#6f6f6f',
        sectionSize,
        sectionThickness: 1,
        sectionColor: '#f5311f',
        fadeStrength: 0,
        followCamera: false,
        infiniteGrid: false,
        position: center,
    };
    return <Grid {...gridConfig} up={upVector} args={[width, height, 1, 1]} />;
}
