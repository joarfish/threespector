import { Card, Descriptions, Space } from 'antd';
import { useStore } from 'zustand';
import { sceneStore, shaderMaterialsStore } from '../Store';
import { shallow } from 'zustand/shallow';
import { type Vector3d } from '../../Common/Scene';
import { useState } from 'react';
import { ShaderMaterialEditorDialog } from './ShaderMaterialEditor';
import { EditOutlined } from '@ant-design/icons';

/**
 * Displays information about selected SceneObject.
 * @constructor
 */
export function ObjectInfo(): JSX.Element {
    const { selectedObject, objectsByUuid } = useStore(
        sceneStore,
        state => ({
            selectedObject: state.selectedObject,
            objectsByUuid: state.scene?.objectByUuid,
        }),
        shallow,
    );
    const shaderMaterialsByUuid = useStore(
        shaderMaterialsStore,
        state => state.materialsByUuid,
    );
    const [editShaderMaterialUuid, setEditShaderMaterialUuid] = useState<
        string | null
    >(null);

    if (selectedObject === null) {
        return <></>;
    }

    if (objectsByUuid === undefined) {
        return <></>;
    }
    const sceneObject = objectsByUuid[selectedObject];

    const title = sceneObject.name === '' ? sceneObject.type : sceneObject.name;

    return (
        <Card title={title} size={'small'}>
            <Space direction={'vertical'}>
                <Descriptions column={1} size={'small'}>
                    <Descriptions.Item label={'UUID'}>
                        {sceneObject.uuid}
                    </Descriptions.Item>
                    <Descriptions.Item label={'Type'}>
                        {sceneObject.type}
                    </Descriptions.Item>
                </Descriptions>
                <Vector3Info
                    vector={sceneObject.position}
                    title={'Local Position'}
                />
                <Vector3Info
                    vector={sceneObject.worldPosition}
                    title={'World Position'}
                />
                <Vector3Info vector={sceneObject.rotation} title={'Rotation'} />
                <Vector3Info vector={sceneObject.scale} title={'Scale'} />
                {sceneObject.materialUuids != null && (
                    <Card
                        title={'Shader Materials'}
                        size={'small'}
                        type={'inner'}>
                        {sceneObject.materialUuids
                            .filter(matUuid =>
                                Object.prototype.hasOwnProperty.call(
                                    shaderMaterialsByUuid,
                                    matUuid,
                                ),
                            )
                            .map(matUuid => (
                                <div key={matUuid}>
                                    {matUuid}
                                    <EditOutlined
                                        onClick={() => {
                                            setEditShaderMaterialUuid(matUuid);
                                        }}
                                    />
                                </div>
                            ))}
                    </Card>
                )}
                {editShaderMaterialUuid !== null && (
                    <ShaderMaterialEditorDialog
                        uuid={editShaderMaterialUuid}
                        onClose={() => {
                            setEditShaderMaterialUuid(null);
                        }}
                    />
                )}
            </Space>
        </Card>
    );
}

function Vector3Info(props: { vector: Vector3d; title: string }): JSX.Element {
    const { vector, title } = props;

    return (
        <Descriptions
            title={title}
            column={1}
            size={'small'}
            bordered={true}
            colon={true}
            layout={'horizontal'}>
            <Descriptions.Item label={'x'}>
                {vector.x.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label={'y'}>
                {vector.y.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label={'z'}>
                {vector.z.toFixed(2)}
            </Descriptions.Item>
        </Descriptions>
    );
}
