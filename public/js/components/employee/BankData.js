const BankData = {
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
                        
            <div class="col-md-8">
                <label for="inputPassword4" class="form-label">Empfänger</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="receiver" >
            </div>
            <div class="col-md-4"></div>
            <!--  -->
            <div class="col-md-4">
                <label for="inputPassword4" class="form-label" >IBAN</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="iban" maxlength="34">
            </div>
            <div class="col-md-4">
                <label for="inputPassword4" class="form-label">BIC</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="bic" maxlength="11">
            </div>
            <div class="col-md-4">
            </div>
            <!-- -->
            <div class="col-md-8">
                <label for="uid" class="form-label">Bank</label>
                <input type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="bank" >
            </div>
            <div class="col-md-4">
            </div>
            <!-- -->
            <div class="col-8">
                <label for="inputAddress" class="form-label">Anmerkung</label>
                <textarea type="text" :readonly="readonly" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly }" id="inputAddress" placeholder="">
                </textarea>
            </div>
            

        </form>


            <div class="d-grid gap-2 col-md-2">
                <button type="button" class="btn btn-sm btn-outline-secondary" @click="toggleMode()">Bearbeiten</button>
            </div>
    </div>
    `
}