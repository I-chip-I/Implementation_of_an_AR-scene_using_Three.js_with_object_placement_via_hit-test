import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

export class Scene_Manager
{
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 0.01, 20 );
    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );

    constructor()
    {
        const light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 3 );
        light.position.set( 0.5, 1, 0.25 );
        this.scene.add( light );
        
        const loader = new RGBELoader();
        loader.load( '../Models_and_tools/ferndale_studio_01_1k.hdr', (texture) =>
        {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            this.scene.environment = texture;
        } );

        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.xr.enabled = true;
        this.renderer.xr.setReferenceSpaceType( 'local-floor' );
        document.body.appendChild( this.renderer.domElement );
    }

    render()
    {
        this.renderer.render( this.scene, this.camera );
    }
}