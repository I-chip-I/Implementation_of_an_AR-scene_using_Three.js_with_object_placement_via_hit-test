import { Scene_Manager } from './Scene_Manager.js';
import { Model_Manager } from './Model_Manager.js';
import { AR_Manager } from './AR_Manager.js';

const scene_manager = new Scene_Manager();
const model_manager = new Model_Manager( '../Models_and_tools/origami_paper_crane_on_string.glb' );
const ar_manager = new AR_Manager( scene_manager, model_manager );

ar_manager.init();

function onWindowResize() 
{
	scene_manager.camera.aspect = window.innerWidth / window.innerHeight;
	scene_manager.camera.updateProjectionMatrix();
	scene_manager.renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener( 'resize', onWindowResize );