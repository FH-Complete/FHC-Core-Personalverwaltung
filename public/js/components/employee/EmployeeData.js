const EmployeeData= {
    setup() {

        const readonly = Vue.ref(true);

        const toggleMode = () => {
            readonly.value = !readonly.value;
        }

        return { readonly, toggleMode }

    },
    template: `
    <div class="col-md-12 d-flex justify-content-between flex-wrap flex-md-nowrap align-items-start pt-3 pb-2 mb-3">

        <form class="row g-3">
            <div class="col-md-4">
                <label for="uid" class="form-label">Personalnummer</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="uid" value="">
            </div>            
            <div class="col-md-4">
                <label for="inputPassword4" class="form-label">Kurzbezeichnung</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="kurzbezeichnung" >
            </div>
            <div class="col-md-4"></div>
            <!--  -->
            <div class="col-md-4">
                <label for="inputPassword4" class="form-label">Stundensatz</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="inputPassword4">
            </div>
            <div class="col-md-4">
                <label for="inputPassword4" class="form-label">Telefonklappe</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="inputPassword4">
            </div>
            <div class="col-md-4">
            </div>
            <!--Location -->
            <div class="col-md-4">
                <label for="inputPassword4" class="form-label">Büro</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="inputPassword4" value="">
            </div>
            <div class="col-md-4">
                <label for="inputPassword4" class="form-label">Standort</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="inputPassword4">
            </div>
            <div class="col-md-4">
            </div>
            <!-- -->
            <div class="col-6">
                <label for="inputAddress" class="form-label">Anmerkung</label>
                <textarea type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="inputAddress" placeholder="1234 Main St">
                </textarea>
            </div>
            <div class="col-2">
                <label for="inputAddress" class="form-label">Alias</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="inputAddress" >
            </div>

        </form>


            <div class="d-grid gap-2 col-md-2">
                <button type="button" class="btn btn-sm btn-outline-secondary" @click="toggleMode()">Bearbeiten</button>
            </div>
    </div>
    `
}