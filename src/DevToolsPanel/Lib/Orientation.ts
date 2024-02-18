export enum Orientation {
    X_Up,
    X_Down,
    Y_Up,
    Y_Down,
    Z_Up,
    Z_Down,
}

export function orientationToVector3(
    orientation: Orientation,
): [number, number, number] {
    switch (orientation) {
        case Orientation.X_Up:
            return [1, 0, 0];
        case Orientation.X_Down:
            return [-1, 0, 0];
        case Orientation.Y_Up:
            return [0, 1, 0];
        case Orientation.Y_Down:
            return [0, -1, 0];
        case Orientation.Z_Up:
            return [0, 0, 1];
        case Orientation.Z_Down:
            return [0, 0, -1];
    }
}
