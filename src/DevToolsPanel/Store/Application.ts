import { createStore } from 'zustand';
import { Orientation } from '../Lib/Orientation';

type ApplicationStore = {
    orientation: Orientation;
    setOrientation: (orientation: Orientation) => void;
};

export const applicationStore = createStore<ApplicationStore>()(set => ({
    orientation: Orientation.Y_Up,
    setOrientation: orientation => {
        set({
            orientation,
        });
    },
}));
