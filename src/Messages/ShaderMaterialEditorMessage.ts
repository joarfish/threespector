import { type ShaderMaterial } from '../Common/Materials';

// Messages related to the shader material editor

type RequestReportMaterials = {
    type: 'RequestReportMaterials';
};

type ReportMaterials = {
    type: 'ReportMaterials';
    materials: ShaderMaterial[];
};

type RequestShaderUpdate = {
    type: 'RequestShaderUpdate';
    shaderType: 'fragmentShader' | 'vertexShader';
    code: string;
    uuid: string;
};

type ReportShaderUpdateSuccess = {
    type: 'ReportShaderUpdateSuccess';
    uuid: string;
};

type MaterialUnknown = {
    type: 'MaterialUnknown';
    uuid: string;
};

export type ShaderMaterialEditorMessage =
    | RequestReportMaterials
    | ReportMaterials
    | RequestShaderUpdate
    | ReportShaderUpdateSuccess
    | MaterialUnknown;
