import { useStore } from 'zustand';
import { applicationStore } from '../Store';
import { Button } from 'antd';
import { Orientation } from '../Lib/Orientation';
import type React from 'react';

export function UpVectorSelection(): React.JSX.Element {
    const orientation = useStore(applicationStore, state => state.orientation);

    return (
        <div>
            <Button
                disabled={orientation === Orientation.Y_Up}
                onClick={() => {
                    applicationStore
                        .getState()
                        .setOrientation(Orientation.Y_Up);
                }}>
                Y-Up
            </Button>
            <Button
                disabled={orientation === Orientation.Z_Up}
                onClick={() => {
                    applicationStore
                        .getState()
                        .setOrientation(Orientation.Z_Up);
                }}>
                Z-Up
            </Button>
        </div>
    );
}
