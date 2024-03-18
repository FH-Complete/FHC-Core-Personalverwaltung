
import { CovidCard } from './CovidCard.js';
import { DvCard } from './DVCard.js';
import { LehreCard } from './LehreCard.js';
import { IssuesCard } from './IssuesCard.js';
import { OffTimeCard } from './OffTimeCard.js';
import { DeadlineIssueTable } from './DeadlineIssueTable.js'
import { DeadlineCard } from './DeadlineCard.js';


export const EmployeeSummary = {
    components: {
        CovidCard,
        DvCard,
        LehreCard,
        IssuesCard,
        OffTimeCard,
        DeadlineIssueTable,
        DeadlineCard,
        
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
                       
                    </div>

                    <div class="col">
                        
                        <lehre-card :uid="currentUID" :date="date"></lehre-card>

                        <br/>

                        <off-time-card :uid="currentUID"></off-time-card> 

                    </div>

                    <deadline-issue-table :uid="currentUID"></deadline-issue-table>

                </div>            

            </div>                      
        </div>

    </div>

    `
}