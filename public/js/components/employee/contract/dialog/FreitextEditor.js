

export const FreitextEditor = {
    components: {
 
    },
    props: {
        editMode: { type: Boolean, required: true },
        personID: { type: Number, required: true },
        personUID: { type: String, required: true },
        writePermission: { type: Boolean, required: false },
        //currentValue: { type: Object, required: true },
    },
    setup( props ) {



    },
    template: `
    <label for="dvFreitext" class="col-sm-3 col-form-label">Freitext</label>
    <div class="row">
        <div class="col-sm-10">
            <b>1.2.2015-</b><br>
            <textarea type="text" readonly rows="5"
                class="form-control-sm form-control-plaintext" id="dvFreitext"
                >Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
            </textarea>
        
        </div>
        <div class="col-sm-2">
            <button type="button" class="btn btn-sm btn-outline-secondary">
                <i class="fa fa-pen"></i>
            </button><button type="button" class="btn btn-sm btn-outline-secondary">
                <i class="fa fa-minus"></i>
            </button>
        </div>
    </div>
    <div class="row">
        <div class="col-sm-10">
            <b>1.2.2015-</b><br>
            <textarea type="text" readonly rows="5"
                class="form-control-sm form-control-plaintext" id="dvFreitext"
                >Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
            </textarea>
        </div>
        <div class="col-sm-2">
            <button type="button" class="btn btn-sm btn-outline-secondary">
                <i class="fa fa-pen"></i>
            </button><button type="button" class="btn btn-sm btn-outline-secondary">
                <i class="fa fa-minus"></i>
            </button>
        </div>
    </div>
    `
}