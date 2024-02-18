import { type JSX } from 'react';
import { SceneTree } from './SceneTree';
import { Viewport } from './Viewport';
import { ObjectInfo } from './ObjectInfo';
import { App, Card, Col, ConfigProvider, Layout, Row, theme } from 'antd';
import { UpVectorSelection } from './UpVectorSelection';

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
                                display: 'flex',
                                flexDirection: 'column',
                            }}>
                            <SceneTree />
                            <div
                                style={{
                                    marginTop: 'auto',
                                }}>
                                <Card title={'Preferences'}>
                                    <UpVectorSelection />
                                </Card>
                            </div>
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
