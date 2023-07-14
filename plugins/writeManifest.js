/**
 * Modifies the given google extension manifest object by adding
 * all bundles to the "web_accessible_resources" property.
 * @param manifest
 * @returns {{generateBundle(*, *): void, name: string}}
 */
export function writeManifest(manifest) {
    return {
        name: 'write-manifest',
        async generateBundle(_options, bundle) {
            const resourceNames = Object.keys(bundle);

            if ('web_accessible_resources' in manifest) {
                manifest['web_accessible_resources'].push({
                    resources: resourceNames,
                    matches: ["<all_urls>"],
                });
            } else {
                manifest['web_accessible_resources'] = [{
                    resources: resourceNames,
                    matches: ["<all_urls>"],
                }];
            }

            this.emitFile({
                type: 'asset',
                name: 'manifest',
                fileName: 'manifest.json',
                source: JSON.stringify(manifest, null, 2),
            });
        },
    }
}
