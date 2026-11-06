import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';

export class AR_Manager
{
    scene_manager = null;
    model_manager = null;
    mark = new THREE.Mesh(
        new THREE.RingGeometry( 0.15, 0.2, 32 ).rotateX( - Math.PI / 2 ),
        new THREE.MeshBasicMaterial()
    );
    controller1 = null;
    controller2 = null;
    hitTestSource = null;
    hitTestSourceRequested = false;
    last_mark_position = new THREE.Vector3();
    last_mark_quaternion = new THREE.Quaternion();
    first_hit = true;

    constructor( scene_manager, model_manager )
    {
        this.scene_manager = scene_manager;
        this.model_manager = model_manager;
        this.controller1 = this.scene_manager.renderer.xr.getController( 0 );
        this.controller2 = this.scene_manager.renderer.xr.getController( 1 );
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

    change_AR_button_design( AR_button )
    {
        AR_button.style.backgroundColor = '#56278c';
        AR_button.style.color = 'white';
        AR_button.style.border = 'none';
        AR_button.style.borderRadius = '12px';
        AR_button.style.fontWeight = '600';
        AR_button.style.whiteSpace = 'nowrap';
        AR_button.style.display = 'block';
        AR_button.style.width = '90%';
        AR_button.style.padding = '16px';
        AR_button.style.boxSizing = 'border-box';
        AR_button.style.position = 'static';
        AR_button.style.margin = '10px auto 0 auto';
        AR_button.style.left = 'auto';
        AR_button.style.right = 'auto';
        AR_button.style.top = 'auto';
        AR_button.style.bottom = 'auto';
        AR_button.style.transform = 'none'; 
    }

    init() 
    {
        const AR_button = ARButton.createButton( this.scene_manager.renderer, { requiredFeatures: [ 'hit-test' ] } );
        const container = document.getElementById( 'ar-button-container' );
        if ( container )
        {
            container.appendChild( AR_button );
        } 
        else 
        {
            document.body.appendChild( AR_button );
        }
        this.change_AR_button_design( AR_button );
    
        this.scene_manager.renderer.setAnimationLoop( this.animate.bind( this ) );

        this.controller1.addEventListener( 'select', this.add_new_object.bind( this ) );
        this.scene_manager.scene.add( this.controller1 );
    
        this.controller2.addEventListener( 'select', this.add_new_object.bind( this ) );
        this.scene_manager.scene.add( this.controller2 );
    
        this.mark.matrixAutoUpdate = false;
        this.mark.visible = false;
        this.scene_manager.scene.add( this.mark );
    }

    process_hit_test_result( frame, referenceSpace )
    {
        const hitTestResults = frame.getHitTestResults( this.hitTestSource );

		if ( hitTestResults.length ) 
        {
			const hit = hitTestResults[ 0 ];

			const new_matrix = new THREE.Matrix4().fromArray( hit.getPose( referenceSpace ).transform.matrix );
			const new_position = new THREE.Vector3();
			const new_quaternion = new THREE.Quaternion();
			new_matrix.decompose( new_position, new_quaternion, new THREE.Vector3() );

			const surface_normal = new THREE.Vector3( 0, 1, 0 ).applyQuaternion( new_quaternion );

			if ( Math.abs( surface_normal.y ) > 0.7)
            {
				if ( this.first_hit == true )
                {
					this.last_mark_position.copy( new_position );
					this.last_mark_quaternion.copy( new_quaternion );
					this.first_hit = false;
				}
				else
				{
					this.last_mark_position.lerp( new_position, 0.15 );
					this.last_mark_quaternion.slerp( new_quaternion, 0.15 );
				}

				this.mark.matrix.compose( this.last_mark_position, this.last_mark_quaternion, new THREE.Vector3( 1, 1, 1 ) );
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
		        this.process_hit_test_result( frame, referenceSpace );
		    }

	    }

        this.scene_manager.render();
    }
}