import { useStore } from 'zustand';
import { sceneStore } from '../Store';
import { type JSX, type Key, useEffect, useMemo, useState } from 'react';
import { Card, Input, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { DownOutlined } from '@ant-design/icons';
import { type SceneObject } from '../../Common/Scene';
import { shallow } from 'zustand/shallow';

/**
 * A tree view of the scene with a filter input.
 * @constructor
 */
export function SceneTree(): JSX.Element {
    const { rootUuid, objectByUuid, selectedObject, selectObject, unselect } =
        useStore(
            sceneStore,
            state => ({
                rootUuid: state.scene?.rootUuid,
                objectByUuid: state.scene?.objectByUuid,
                selectedObject: state.selectedObject,
                selectObject: state.selectObject,
                unselect: state.unselect,
            }),
            shallow,
        );
    const [expanded, setExpanded] = useState<Key[]>([]);
    const [filterString, setFilterString] = useState<string | undefined>(
        undefined,
    );

    useEffect(() => {
        if (selectedObject === null) {
            return;
        }
        setExpanded([...expanded, selectedObject]);
    }, [selectedObject]);

    const treeData = useMemo(() => {
        if (rootUuid === undefined || objectByUuid === undefined) {
            return [];
        }
        const data = treeDataFromScene(rootUuid, objectByUuid, filterString);

        return data === null ? [] : [data];
    }, [rootUuid, objectByUuid, filterString]);

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
        <Card
            size={'small'}
            className={'scene-tree'}
            title={'Scene'}
            style={{ height: '100%' }}>
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
                defaultExpandedKeys={[rootUuid]}
                onSelect={keys => {
                    if (keys.length === 0) {
                        unselect();
                    } else {
                        selectObject(keys[0] as string);
                    }
                }}
                treeData={treeData}
                selectedKeys={selectedObject === null ? [] : [selectedObject]}
                autoExpandParent={true}
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
        children: rootObject.children.map(uuid =>
            treeDataFromScene(uuid, objectByUuid, filterString),
        ) as DataNode[],
    };
}
