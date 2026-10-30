export class UI_Manager
{
    scene_manager = null;
    model_manager = null;
    ar_manager = null;
    main_page = document.getElementById('main-page');
    type_selector = document.getElementById('type-selector');
    model_selector = document.getElementById('model-selector');
    model_demo = document.getElementById('model-demo');
    use_button = document.getElementById('use-button');
    ar_page_ui = document.getElementById('ar-page-ui');
    prompt_banner = document.getElementById('prompt-banner');
    exit_button = document.getElementById('exit-button');

    constructor( scene_manager, model_manager, ar_manager )
    {
        this.scene_manager = scene_manager;
        this.model_manager = model_manager;
        this.ar_manager = ar_manager;
    }

    init()
    {
        this.type_selector.addEventListener( 'change', (event) =>
        {
            if (event.target.value === 'ceiling') {
                this.model_selector.disabled = false;
                this.model_selector.innerHTML = '<option value="crane">Origami Crane</option>';
            } else {
                this.model_selector.disabled = true;
                this.model_selector.innerHTML = '<option value="">-- Choose model --</option>';
                this.model_selector.value = "";
            }

            this.update_UI();
        });

        this.model_selector.addEventListener( 'change', () =>
        {
            this.update_UI();
        });

        this.use_button.addEventListener( 'click', () =>
        {
            document.body.style.backgroundColor = 'transparent';
            this.main_page.style.display = 'none';
            this.ar_page_ui.classList.add( 'active' );

            const ar_use_button = document.querySelector( '.ar-button' );
            if ( ar_use_button ) 
            {
                ar_use_button.click();
            }
        });

        this.exit_button.addEventListener( 'click', () =>
        {
            document.body.style.backgroundColor = '#5e2b97';
             this.main_page.style.display = 'flex';
            this.ar_page_ui.classList.remove( 'active' );
            
            const session = this.scene_manager.renderer.xr.getSession();
            if ( session )
            {
                session.end();
            }
        });
    }

    update_UI()
    {
        const selected_model = this.model_selector.value;
        
        if ( selected_model === 'crane' ) {
            this.use_button.disabled = false;
            this.model_demo.src = './Models_and_tools/origami_paper_crane_on_string.glb';
        } else {
            this.use_button.disabled = true;
            this.model_demo.src = '';
        }
    }

    update_prompt( new_prompt ) {
        this.prompt_banner.innerText = new_prompt;
    }
}