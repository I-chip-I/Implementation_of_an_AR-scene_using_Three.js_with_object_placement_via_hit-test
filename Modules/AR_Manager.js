import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';

export class AR_Manager
{
    scene_manager = null;
    model_manager = null;
    mark = null;
    controller1 = null;
    controller2 = null;
    hitTestSource = null;
    hitTestSourceRequested = false;
    last_mark_position = new THREE.Vector3();
    last_mark_quarternion = new THREE.Quaternion();
    first_hit = true;

    constructor( scene_manager, model_manager )
    {
        this.scene_manager = scene_manager;
        this.model_manager = model_manager;
    }

    add_new_object()
    {
        if ( this.mark.visible && this.model_manager.decoration_model != null ) 
        { 
            const decoration_object = this.model_manager.create_new_copy();
                            
            this.mark.matrix.decompose( decoration_object.position, decoration_object.quaternion, decoration_object.scale );
    
            decoration_object.position.y = 2;
            decoration_object.scale.set( 0.5, 0.5, 0.5 );
    
            this.scene_manager.scene.add( decoration_object );
        }
    }

    init() 
    {
        document.body.appendChild( ARButton.createButton( this.scene_manager.renderer, { requiredFeatures: [ 'hit-test' ] } ) );
    
        this.scene_manager.renderer.setAnimationLoop( this.animate.bind( this ) );

        this.controller1 = this.scene_manager.renderer.xr.getController( 0 );
        this.controller1.addEventListener( 'select', this.add_new_object.bind( this ) );
        this.scene_manager.scene.add( this.controller1 );
    
        this.controller2 = this.scene_manager.renderer.xr.getController( 1 );
        this.controller2.addEventListener( 'select', this.add_new_object.bind( this ) );
        this.scene_manager.scene.add( this.controller2 );
    
        this.mark = new THREE.Mesh(
            new THREE.RingGeometry( 0.15, 0.2, 32 ).rotateX( - Math.PI / 2 ),
            new THREE.MeshBasicMaterial()
        );
        this.mark.matrixAutoUpdate = false;
        this.mark.visible = false;
        this.scene_manager.scene.add( this.mark );
    }

    animate( timestamp, frame ) 
    {

	    if ( frame ) 
        {

		    const referenceSpace = this.scene_manager.renderer.xr.getReferenceSpace();
		    const session = this.scene_manager.renderer.xr.getSession();

		    if ( this.hitTestSourceRequested === false )
            {
			    session.requestReferenceSpace( 'viewer' ).then( ( referenceSpace ) =>
                {
                    session.requestHitTestSource( { space: referenceSpace } ).then( ( source ) =>
                    {
				        this.hitTestSource = source;
			        } );
			    } );

			    session.addEventListener( 'end', () =>
                {
				    this.hitTestSourceRequested = false;
				    this.hitTestSource = null;
			    } );

			    this.hitTestSourceRequested = true;
		    }

		    if ( this.hitTestSource ) 
            {
		        const hitTestResults = frame.getHitTestResults( this.hitTestSource );

			    if ( hitTestResults.length ) 
                {
				    const hit = hitTestResults[ 0 ];

				    const new_matrix = new THREE.Matrix4().fromArray( hit.getPose( referenceSpace ).transform.matrix );
				    const new_position = new THREE.Vector3();
				    const new_quarternion = new THREE.Quaternion();
				    new_matrix.decompose( new_position, new_quarternion, new THREE.Vector3() );

				    const surface_normal = new THREE.Vector3( 0, 1, 0 ).applyQuaternion( new_quarternion );

				    if ( Math.abs( surface_normal.y ) > 0.7)
                    {
					    if ( this.first_hit == true )
                        {
						    this.last_mark_position.copy( new_position );
						    this.last_mark_quarternion.copy( new_quarternion );
						    this.first_hit = false;
					    }
					    else
					    {
						    this.last_mark_position.lerp( new_position, 0.15 );
						    this.last_mark_quarternion.slerp( new_quarternion, 0.15 );
					    }

				        this.mark.matrix.compose( this.last_mark_position, this.last_mark_quarternion, new THREE.Vector3( 1, 1, 1 ) );
					    this.mark.visible = true;
				    }
				    else
				    {
					    this.mark.visible = false;
				    }
			    } 
                else
                {
				    this.mark.visible = false;
				    this.first_hit = true;
			    }
		    }

	    }

        this.scene_manager.render();
    }
}