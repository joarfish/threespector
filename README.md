# ThreeSpector-Extension

*Chrome Extension for Inspecting your ThreeJs Scenes.*

## Important Note

This project is in a very early stage! Currently, you can use this extension to get a very coarse overview of your
scene, as well as edit the shaders of `ShaderMaterial`s and `RawShaderMaterial`s on the fly.

## What's possible to do with threespector?

### Complex Scene

All meshes are represented by their bounding boxes. Lights are also visible.

<a href="https://jonasklein.dev/threespector/example_scene_tree.png" target="_blank">
<img src="https://jonasklein.dev/threespector/example_scene_tree_s.png" width="400" />
</a>

Use the filter input to filter the tree by object-types and -names.

<a href="https://jonasklein.dev/threespector/example_scene_filter.png" target="_blank">
<img src="https://jonasklein.dev/threespector/example_scene_filter_s.png" width="400" />
</a>

### Shader Editor

When working on shaders it is sometimes quite cumbersome to reload the scene on every tiny change. With threespector
you can edit your GLSL code and update the shaders directly without reloading the scene. This should be especially
helpful when experimenting:

<a href="https://jonasklein.dev/threespector/example_shader_edit.png" target="_blank">
<img src="https://jonasklein.dev/threespector/example_shader_edit_s.png" width="400" />
</a>

## Installation

At this point the extension has not been published in the Chrome Web Store. So, you need to build it yourself or
download the latest release and install it manually:

1. Download the latest release and unpack in a folder of your choice.
2. Open chrome and go to `chrome://extensions/`
2. Turn on **Developer Mode**
3. Click **Load unpacked**
4. Point chrome to the directory you unpacked the extension to. It should be the one that contains `manifest.json`

### Building the extension yourself

If you want to build the extension yourself, just clone this repository, install all dependecies via `yarn install`
and run `yarn build`. The extension will be placed in `./dist/`. When installing the extension in Chrome point it to
the `dist`directory.

## Using ThreeSpector

In order for ThreeSpector to find your scene you need to expose it globally in your project. As soon as you open
the developer tools panel of the extension, it will look for `___threespector_scene___` and hook into it. So, all
you have to do is:
```javascript
const scene = new THREE.Scene();
window.___threespector_scene___ = scene;
```

## State of Development

The goal with this first release was to get the extension out and do some testing. The code and
its architecture will definitely change.
