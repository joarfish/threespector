export type ShaderType = 'fragmentShader' | 'vertexShader';

export type ShaderMaterial = {
    uuid: string;
    vertexShader: string;
    fragmentShader: string;
};
