import { useStore } from 'zustand';
import { sceneStore } from '../Store';
import { type JSX, type Key, useEffect, useMemo, useState } from 'react';
import { Card, Input, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { DownOutlined } from '@ant-design/icons';
import { type SceneObject } from '../../Common/Scene';
import { shallow } from 'zustand/shallow';
import { useSceneController } from '../Controller/SceneController';

/**
 * A tree view of the scene with a filter input.
 * @constructor
 */
export function SceneTree(): JSX.Element {
    const sceneController = useSceneController();
    const { rootUuid, selectedObject, selectObject, unselect, sceneVersion } =
        useStore(
            sceneStore,
            state => ({
                rootUuid: state.scene.rootUuid,
                selectedObject: state.selectedObject,
                selectObject: state.selectObject,
                unselect: state.unselect,
                sceneVersion: state.sceneVersion,
            }),
            shallow,
        );
    const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
    const [filterString, setFilterString] = useState<string | undefined>(
        undefined,
    );

    useEffect(() => {
        if (selectedObject === null) {
            return;
        }

        setExpandedKeys([
            ...expandedKeys.filter(key => key !== selectedObject),
            selectedObject,
        ]);
    }, [selectedObject]);

    const treeData = useMemo(() => {
        if (rootUuid === null) {
            return [];
        }
        const objectByUuid = sceneStore.getState().scene.objectByUuid;
        const data = treeDataFromScene(rootUuid, objectByUuid, filterString);

        return data === null ? [] : [data];
    }, [rootUuid, sceneVersion, filterString]);

    const objectByUuid = sceneStore.getState().scene.objectByUuid;
    const objects = sceneStore.getState().scene.objects;

    if (rootUuid === undefined || objectByUuid === undefined) {
        return <span>No scene available</span>;
    }

    const handleFilterInput = (value: string): void => {
        if (value === '' || value.length < 3) {
            setFilterString(undefined);
        } else {
            setFilterString(value.toLowerCase());
        }
    };

    return (
        <Card size={'small'} className={'scene-tree'} title={'Scene'}>
            <Input.Search
                placeholder={'Filter'}
                onSearch={handleFilterInput}
                onChange={(event): void => {
                    handleFilterInput(event.target.value);
                }}
            />
            <Tree
                showLine
                switcherIcon={<DownOutlined />}
                defaultExpandedKeys={rootUuid !== null ? [rootUuid] : []}
                onSelect={keys => {
                    if (keys.length === 0) {
                        unselect();
                    } else {
                        selectObject(keys[0] as string);
                    }
                }}
                onDoubleClick={(event, node) => {
                    sceneController.setCameraToObject(node.key as string);
                    selectObject(node.key as string);
                    event.stopPropagation();
                }}
                onExpand={keys => {
                    setExpandedKeys(keys);
                }}
                expandedKeys={expandedKeys.filter(key =>
                    objects.includes(key as string),
                )}
                treeData={treeData}
                selectedKeys={selectedObject === null ? [] : [selectedObject]}
            />
        </Card>
    );
}

/**
 * Create tree data required by antd's tree component. Can optionally be filtered.
 * @param rootUuid
 * @param objectByUuid
 * @param filterString
 */
function treeDataFromScene(
    rootUuid: string,
    objectByUuid: Record<string, SceneObject>,
    filterString?: string,
): DataNode | null {
    const rootObject = objectByUuid[rootUuid];

    if (rootObject === undefined) {
        return null;
    }

    if (filterString !== undefined) {
        const children = rootObject.children
            .map(uuid => treeDataFromScene(uuid, objectByUuid, filterString))
            .filter(c => c !== null) as DataNode[];
        const rootMatches =
            rootObject.name.toLowerCase().match(filterString) !== null ||
            rootObject.type.toLowerCase().match(filterString) !== null;

        if (children.length === 0 && !rootMatches) {
            return null;
        }
        return {
            title: rootObject.name !== '' ? rootObject.name : rootObject.type,
            key: rootObject.uuid,
            children,
        };
    }

    return {
        title: rootObject.name !== '' ? rootObject.name : rootObject.type,
        key: rootObject.uuid,
        children: rootObject.children
            .map(uuid => treeDataFromScene(uuid, objectByUuid, filterString))
            .filter(child => child !== null) as DataNode[],
    };
}
