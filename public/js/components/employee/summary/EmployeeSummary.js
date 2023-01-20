
import { CovidCard } from './CovidCard.js';
import { DvCard } from './DVCard.js';
import { LehreCard } from './LehreCard.js';
import { TimelineCard } from './TimelineCard.js';

export const EmployeeSummary = {
    components: {
        CovidCard,
        DvCard,
        LehreCard,
        TimelineCard,
    },
    props: {
        date: Date,
    },
    setup() {


        const route = VueRouter.useRoute();
        const { watch, ref, onMounted } = Vue; 
        const currentPersonID = ref(null);
        const currentUID = ref(null);

        onMounted(() => {
            currentPersonID.value = route.params.id;
            currentUID.value = route.params.uid;
        })

        watch(
			() => route.params.id,
			newId => {
				currentPersonID.value = newId;
			}
		)

        watch(
			() => route.params.uid,
			newId => {
				currentUID.value = newId;
			}
		)

        return {currentPersonID, currentUID, date}
    },
    template: `
    <div class="d-flex justify-content-between align-items-center ms-sm-auto col-lg-12 p-md-2">
      <div class="container-fluid px-1">

            <div class="row">

                <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
                    <Toast ref="toastRef">
                        <template #body><h4>Vertrag gespeichert.</h4></template>
                    </Toast>
                </div>

                <div class="row pt-md-4">

                    <div class="col">
                        
                        <timeline-card :uid="currentUID"></timeline-card>

                        <dv-card :uid="currentUID" date="2023-01-01" ></dv-card>

                    </div>          

                    <div class="col">
                        
                        <covid-card :personID="currentPersonID"></covid-card>

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
                        
                        <lehre-card :uid="currentUID"></lehre-card>

                        <br/>
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