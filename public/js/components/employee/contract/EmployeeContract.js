
export const EmployeeContract = {
    props: {
        
    },
    setup() {

        const route = VueRouter.useRoute();
        const currentPersonID = Vue.ref(null);

        Vue.onMounted(() => {
            console.log('contract mounted');
            currentPersonID.value = route.params.id;
        })

        Vue.watch(
			() => route.params.id,
			newId => {
				currentPersonID.value = newId;
			}
		)

        return {currentPersonID}
    },
    template: `
    <div class="row">

        <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
        <Toast ref="toastRef">
            <template #body><h4>Vertrag gespeichert.</h4></template>
        </Toast>
        </div>

        <div class="d-flex bd-highlight">
            <div class="flex-grow-1 bd-highlight"><h4>Verträge</h4></div>        
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
    
    
    <div class="row">

        <div class="col-lg-12">        
        
            <div class="table-responsive">
                <table class="table table-bordered table-hover table-striped tablesorter">
                    <thead>
                    <tr>
                        <th>Von <i class="fa fa-sort"></i></th>
                        <th>Bis <i class="fa fa-sort"></i></th>
                        <th>Änderungsdatum <i class="fa fa-sort"></i></th>
                        <th>Art <i class="fa fa-sort"></i></th>
                        <th>Stunden <i class="fa fa-sort"></i></th>
                        <th>Betrag <i class="fa fa-sort"></i></th>
                        <th>Ist <i class="fa fa-sort"></i></th>
                    </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1.2.2020</td>
                            <td></td>
                            <td>5.3.2021</td>
                            <td>unbefristet</td>
                            <td>38,5</td>
                            <td>2345,67</td>
                            <td>2445,00</td>
                        </tr>
                        <tr>
                            <td>1.2.2021</td>
                            <td></td>
                            <td>5.3.2021</td>
                            <td>Sideletter</td>
                            <td>38,5</td>
                            <td>2545,67</td>
                            <td>2545,67</td>
                        </tr>
                        <tr>
                            <td>31.1.2019</td>
                            <td>31.1.2020</td>
                            <td>5.3.2021</td>
                            <td>befristet</td>
                            <td>38,5</td>
                            <td>2345,67</td>
                            <td>2345,67</td>
                        </tr>									
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>

                    </tbody>
                </table>
            </div>
            
        </div> 

    </div>



    `
}