
export const EmployeeSummary = {
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
    <div class="d-flex justify-content-between align-items-center ms-sm-auto col-lg-12 p-md-2">
      <div class="container-fluid px-0">

            <div class="row">

                <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
                    <Toast ref="toastRef">
                        <template #body><h4>Vertrag gespeichert.</h4></template>
                    </Toast>
                </div>

                <div class="row pt-md-4">

                    <div class="col">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Dienstverhältnis</h5>
                                </div>
                                <div class="card-body" style="text-align:center">
                                <div v-if="isFetching" class="spinner-border" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>            
                                <h3 v-if="!isFetching">{{ birthdayData?.length }}</h3>
                                von - bis<br>
                                Funktion<br>
                                Gehalt
                            </div>
                        </div>

                    </div>          

                    <div class="col">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">COVID Zertifikat</h5>
                                </div>
                                <div class="card-body" style="text-align:center">
                                <div v-if="isFetching" class="spinner-border" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>            
                                <h3 v-if="!isFetching">{{ birthdayData?.length }}</h3>
                            </div>
                        </div>

                        <br/>
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Home Office</h5>
                                </div>
                                <div class="card-body" style="text-align:center">
                                <div v-if="isFetching" class="spinner-border" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>            
                                <h3 v-if="!isFetching">{{ birthdayData?.length }}</h3>
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        
                        <div class="card-header">
                            <h5 class="mb-0">Lehre</h5>
                            </div>
                            <div class="card-body" style="text-align:center">
                            <div v-if="isFetching" class="spinner-border" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>            
                            <h3 v-if="!isFetching">{{ birthdayData?.length }}</h3>
                        </div>

                        <div class="card-header">
                            <h5 class="mb-0">Urlaub/Krankenstand</h5>
                            </div>
                            <div class="card-body" style="text-align:center">
                            <div v-if="isFetching" class="spinner-border" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>            
                            <h3 v-if="!isFetching">{{ birthdayData?.length }}</h3>
                        </div>

                    </div>

                </div>            

            </div>                      
        </div>

    `
}