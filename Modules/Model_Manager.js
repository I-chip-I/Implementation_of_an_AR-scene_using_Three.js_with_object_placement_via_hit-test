import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Model_Manager
{
    decoration_model = null;
    loader = new GLTFLoader();

    constructor( file_path )
    {
        this.load_new_model( file_path );
    }

    load_new_model( file_path )
    {
        this.loader.load( file_path, (gltf) => { this.decoration_model = gltf.scene; });
    }

    create_new_copy()
    {
        return this.decoration_model.clone();
    }
}