
export default {
    setup() {

    },
    template: `
    <div class="row">

        <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
        <Toast ref="toastRef">
            <template #body><h4>Gehalt gespeichert.</h4></template>
        </Toast>
        </div>

        <div class="d-flex bd-highlight">
            <div class="flex-grow-1 bd-highlight"><h4>Gehalt</h4></div>        
            <div class="p-2 bd-highlight">
            <div class="d-grid gap-2 d-md-flex justify-content-end ">
                <button v-if="readonly" type="button" class="btn btn-sm btn-outline-secondary" @click="toggleMode()">
                    <i class="fa fa-plus"></i>
                </button>
                <button v-if="!readonly" type="button" class="btn btn-sm btn-outline-secondary" @click="toggleMode()"><i class="fa fa-minus"></i></button>
                <button v-if="!readonly" type="button" class="btn btn-sm btn-outline-secondary" @click="save()"><i class="fa fa-floppy-disk"></i></button>
            </div>

            </div>
        </div>

    </div>

    `
}