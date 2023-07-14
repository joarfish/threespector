import { sceneStore } from './Scene';
import { shaderMaterialsStore } from './ShaderMaterials';

// Re-export the stores of the application:
export { sceneStore, shaderMaterialsStore };

/**
 * Resets the state of all stores. This should be done when the website being
 * inspected has reloaded.
 */
export function resetState(): void {
    shaderMaterialsStore.getState().reset();
    sceneStore.getState().reset();
}
