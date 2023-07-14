import { type JSX } from 'react';
import { SceneTree } from './SceneTree';
import { Viewport } from './Viewport';
import { ObjectInfo } from './ObjectInfo';
import { App, Col, ConfigProvider, Layout, Row, theme } from 'antd';

const { darkAlgorithm } = theme;

/**
 * Main DevPanel UI
 * @constructor
 */
export function DevToolsPanel(): JSX.Element {
    return (
        <ConfigProvider
            theme={{
                algorithm: darkAlgorithm,
                token: {
                    fontSize: 12,
                    sizeStep: 4,
                    sizeUnit: 1,
                },
            }}>
            <App>
                <Layout>
                    <Row
                        style={{
                            width: '100vw',
                            height: '100vh',
                        }}>
                        <Col
                            span={5}
                            style={{
                                maxHeight: '100vh',
                                overflow: 'auto',
                                overflowX: 'hidden',
                            }}>
                            <SceneTree />
                        </Col>
                        <Col
                            span={14}
                            style={{ maxHeight: '100vh', overflow: 'hidden' }}>
                            <Viewport />
                        </Col>
                        <Col
                            span={5}
                            style={{
                                maxHeight: '100vh',
                                overflowY: 'auto',
                                overflowX: 'hidden',
                            }}>
                            <ObjectInfo />
                        </Col>
                    </Row>
                </Layout>
            </App>
        </ConfigProvider>
    );
}
