
import { CovidCard } from './CovidCard.js';
import { DvCard } from './DVCard.js';
import { LehreCard } from './LehreCard.js';
import { IssuesCard } from './IssuesCard.js';
import { OffTimeCard } from './OffTimeCard.js';

export const EmployeeSummary = {
    components: {
        CovidCard,
        DvCard,
        LehreCard,
        IssuesCard,
        OffTimeCard,
    },
    props: {
        date: Date,
    },
    setup() {


        const route = VueRouter.useRoute();
        const { watch, ref, onMounted } = Vue; 
        const currentPersonID = ref(null);
        const currentUID = ref(null);
        const isFetching = ref(false);

        onMounted(() => {
            currentPersonID.value = parseInt(route.params.id);
            currentUID.value = route.params.uid;
        })

        watch(
			() => route.params.id,
			newId => {
				currentPersonID.value = parseInt(newId);
			}
		)

        watch(
			() => route.params.uid,
			newId => {
				currentUID.value = newId;
			}
		)

       /* watch(
			() => route.query.d,
			newDate => {
				date = newDate;
			}
		)*/

        return {currentPersonID, currentUID, isFetching}
    },
    template: `
    <div class="d-flex justify-content-between align-items-center ms-sm-auto col-lg-12 p-md-2">
      <div class="container-fluid px-1">

            <div class="row">                

                <div class="row pt-md-4">

                    <div class="col">
                        
                        <dv-card :uid="currentUID" :date="date" ></dv-card>
            
                    </div>          

                    <div class="col">
                        
                        <!--covid-card :personID="currentPersonID" :date="date"></covid-card-->

                        <issues-card></issues-card>

                        <br/>
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Home Office</h5>
                                </div>
                                <div class="card-body" style="text-align:center">
                                    <div v-if="isFetching" class="spinner-border" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>            
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        
                        <lehre-card :uid="currentUID" :date="date"></lehre-card>

                        <br/>

                        <off-time-card :uid="currentUID"></off-time-card> 

                    </div>

                </div>            

            </div>                      
        </div>

    </div>

    `
}