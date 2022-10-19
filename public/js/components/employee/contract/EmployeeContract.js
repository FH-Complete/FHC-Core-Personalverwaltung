
export const EmployeeContract = {
    props: {
        personUID: { type: String, required: true },
        writePermission: { type: Boolean, required: false },
    },
    setup() {

        const route = VueRouter.useRoute();
        const currentPersonID = Vue.ref(null);
        const dvList = Vue.ref([]);
        const urlDV = Vue.ref("");

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

        const generateDVEndpointURL = () => {
            let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
            return `${full}/extensions/FHC-Core-Personalverwaltung/api/dvByPersonID?uid=${currentPersonID.value}`;
        };

        const fetchData = async () => {
            if (currentPersonID.value==null) {
                dvList.value = [];
                return;
            }
            isFetching.value = true
            try {
              const res = await fetch(urlDV.value)
              let response = await res.json()
              isFetching.value = false
              console.log(response.retval);
              dvList.value = response.retval;
            } catch (error) {
              console.log(error)
              isFetching.value = false
            }
          }

        return {currentPersonID}
    },
    template: `
    <div class="d-flex justify-content-between align-items-center ms-sm-auto col-lg-12 p-md-2">
      <div class="container-fluid px-0">

            <div class="row">

                <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
                    <Toast ref="toastRef">
                        <template #body><h4>Vertrag gespeichert.</h4></template>
                    </Toast>
                </div>

                <div class="d-flex bd-highlight">            
                    <div class="flex-grow-1 bd-highlight">
                        <div class="d-grid gap-2 d-md-flex ">
                            <h4>Dienstverhältnis</h4>    
                            <select class="form-select" aria-label="Default select example">
                            <option selected>Open this select menu</option>
                            <option value="1">1.1.2000 - 31.12.2005, echter DV</option>
                            <option value="2">1.1.2006 - ?</option>
                            </select>            
                        </div>
                    </div>        
                    <div class="p-2 bd-highlight">
                        <div class="d-grid gap-2 d-md-flex justify-content-end ">
                            <button v-if="readonly" type="button" class="btn btn-sm btn-outline-secondary" @click="toggleMode()">
                                <i class="fa fa-plus"></i>
                            </button>
                            <button v-if="!readonly" type="button" class="btn btn-sm btn-outline-secondary" @click="toggleMode()"><i class="fa fa-plus"></i></button>
                            <button v-if="!readonly" type="button" class="btn btn-sm btn-outline-secondary" @click="save()"><i class="fa fa-minus"></i></button>
                        </div>

                    </div>
                </div>


                <!-- div class="d-flex bd-highlight">            
                    <div class="flex-grow-1 bd-highlight"><h4>Verträge</h4></div>        
                    <div class="p-2 bd-highlight">
                        <div class="d-grid gap-2 d-md-flex justify-content-end ">
                            <button v-if="readonly" type="button" class="btn btn-sm btn-outline-secondary" @click="toggleMode()">
                                <i class="fa fa-plus"></i>
                            </button>
                            <button v-if="!readonly" type="button" class="btn btn-sm btn-outline-secondary" @click="toggleMode()"><i class="fa fa-plus"></i></button>
                            <button v-if="!readonly" type="button" class="btn btn-sm btn-outline-secondary" @click="save()"><i class="fa fa-minus"></i></button>
                        </div>

                    </div>
                </div -->

            </div>
            
            
            <div class="row">

                <div class="col-lg-12">        
                
                    <!--div class="table-responsive">
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
                    </div-->  <!-- table -->

                    <div class="accordion" id="accordionExample">
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="headingOne">
                            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                Accordion Item #1
                            </button>
                            </h2>
                            <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                            <div class="accordion-body">
                                <strong>This is the first item's accordion body.</strong> It is shown by default, until the collapse plugin adds the appropriate classes that we use to style each element. These classes control the overall appearance, as well as the showing and hiding via CSS transitions. You can modify any of this with custom CSS or overriding our default variables. It's also worth noting that just about any HTML can go within the <code>.accordion-body</code>, though the transition does limit overflow.
                            </div>
                            </div>
                        </div>
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="headingTwo">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                Accordion Item #2
                            </button>
                            </h2>
                            <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                            <div class="accordion-body">
                                <strong>This is the second item's accordion body.</strong> It is hidden by default, until the collapse plugin adds the appropriate classes that we use to style each element. These classes control the overall appearance, as well as the showing and hiding via CSS transitions. You can modify any of this with custom CSS or overriding our default variables. It's also worth noting that just about any HTML can go within the <code>.accordion-body</code>, though the transition does limit overflow.
                            </div>
                            </div>
                        </div>
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="headingThree">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                                Accordion Item #3
                            </button>
                            </h2>
                            <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
                            <div class="accordion-body">
                                <strong>This is the third item's accordion body.</strong> It is hidden by default, until the collapse plugin adds the appropriate classes that we use to style each element. These classes control the overall appearance, as well as the showing and hiding via CSS transitions. You can modify any of this with custom CSS or overriding our default variables. It's also worth noting that just about any HTML can go within the <code>.accordion-body</code>, though the transition does limit overflow.
                            </div>
                            </div>
                        </div>
                        </div>

                    
                </div> <!-- --> 

            </div>
        </div>


    `
}