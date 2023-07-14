import { useStore } from 'zustand';
import { shaderMaterialsStore, SyncState } from '../Store/ShaderMaterials';
import { type JSX } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { shallow } from 'zustand/shallow';
import { Button, Collapse, Modal } from 'antd';
import { useShaderMaterialEditorController } from '../Controller/ShaderMaterialEditorController';

export function ShaderMaterialEditorDialog(props: {
    uuid: string;
    onClose: () => void;
}): JSX.Element {
    const { uuid } = props;
    const { material, state, updateShader } = useStore(
        shaderMaterialsStore,
        state => ({
            material: state.materialsByUuid[uuid],
            state: state.materialStateByUuid[uuid],
            updateShader: state.updateShader,
        }),
        shallow,
    );
    const editorModel = useShaderMaterialEditorController();

    return (
        <Modal
            title={`Edit Shaders: ${uuid}`}
            closable={true}
            open={true}
            onCancel={props.onClose}
            footer={[
                <Button
                    key={'submit'}
                    type={'primary'}
                    onClick={() => {
                        editorModel.applyUpdatedShader(uuid);
                    }}>
                    Apply
                </Button>,
            ]}>
            <Collapse
                size={'small'}
                items={[
                    {
                        key: 'vertexShader',
                        label: 'Vertex Shader',
                        children: (
                            <div
                                style={{
                                    maxHeight: '30vh',
                                    overflow: 'auto',
                                }}>
                                <CodeEditor
                                    value={material.vertexShader}
                                    language={'glsl'}
                                    onChange={event => {
                                        updateShader(
                                            uuid,
                                            'vertexShader',
                                            event.target.value,
                                        );
                                    }}
                                    data-color-mode={'dark'}
                                    disabled={state === SyncState.UpdatePending}
                                />
                            </div>
                        ),
                    },
                    {
                        key: 'fragmentShader',
                        label: 'Fragment Shader',
                        children: (
                            <div
                                style={{
                                    maxHeight: '30vh',
                                    overflow: 'auto',
                                }}>
                                <CodeEditor
                                    value={material.fragmentShader}
                                    language={'glsl'}
                                    onChange={event => {
                                        updateShader(
                                            uuid,
                                            'fragmentShader',
                                            event.target.value,
                                        );
                                    }}
                                    data-color-mode={'dark'}
                                    disabled={state === SyncState.UpdatePending}
                                    style={{
                                        display: 'flex',
                                    }}
                                />
                            </div>
                        ),
                    },
                ]}
            />
        </Modal>
    );
}
