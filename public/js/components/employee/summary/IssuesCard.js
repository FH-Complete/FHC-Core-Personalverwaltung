import {CoreRESTClient} from '../../../../../../js/RESTClient.js';

export const IssuesCard = {
     components: {
        
     },
     props: {
       
     },
     setup( props ) {

        const { watch, ref, toRefs, onMounted, inject } = Vue;         
        const route = VueRouter.useRoute();
        const isFetching = Vue.ref(false);
        const title = Vue.ref("Issues");
        const currentPersonID = ref(null);
        const currentDate = Vue.ref(null);        
        const issues = ref([]);
        const vertragsbestandteiltypen = inject('vertragsbestandteiltypen');
        const gehaltstypen = inject('gehaltstypen');
        const vertragsarten = inject('vertragsarten');
        const fhcApi = inject('$fhcApi')  
        
        const formatVertragsbestandteiltyp = (item) => {
          let va = vertragsbestandteiltypen.value.find(kt => kt.value == item);
          return va != undefined ? va.label : item;
        }

        const formatGehaltstyp = (item) => {
          let va = gehaltstypen.value.find(kt => kt.value == item);
          return va != undefined ? va.label : item;
        }

        const formatVertragsart = (item) => {
            let va = vertragsarten.value.find(kt => kt.value == item);
            return va != undefined ? va.label : item;
        }
        

        const formatDate = (ds) => {
            if (ds == undefined) return '';
            var d = new Date(ds);
            return d.getDate()  + "." + (d.getMonth()+1) + "." + d.getFullYear()
        }
        
        const fetchIssues = async () => {
            if (currentPersonID.value == null) {
                return;
            }
			try {
              isFetching.value = true;
              const response = await fhcApi.factory.Issue.byPerson(currentPersonID.value);
              isFetching.value = false;              
			  console.log(response.data.retval);	  
              if (response.data.retval.length>0) {
                issues.value = response.data.retval;
                getBehebungData(issues.value);
              } else {
                issues.value = null;
              }
			} catch (error) {
			  console.log(error);
			} finally {
                isFetching.value = false;
            }	
		}

        onMounted(() => {
            currentDate.value = props.date || new Date();
            currentPersonID.value = parseInt(route.params.id);
            fetchIssues();
        })

        const getVB = async (vbid) =>  {
            try {
                let res = await Vue.$fhcapi.Vertragsbestandteil.getVB(vbid)
                console.log(res);
                return res;
            } catch(error) {
                console.log(error);
            }
            return null;
        }

        const getGB = async (gbid) =>  {
            try {
                let res = await Vue.$fhcapi.Gehaltsbestandteil.getGB(gbid)
                console.log(res);
                return res;
            } catch(error) {
                console.log(error);
            }
            return null;
        }
        const getDV = async (dvid) =>  {
            try {
                let res = await Vue.$fhcapi.DV.getDVByID(dvid)
                console.log(res);
                return res;
            } catch(error) {
                console.log(error);
            }
            return null;
        }

        const getBehebungData = ( issues ) => {

            issues.forEach(issue => {

                let behebungParam = JSON.parse(issue.behebung_parameter);  // why is it a string?

                const keys = Object.keys(behebungParam);
                keys.forEach((key, index) => {              

                    switch (key) {
                        case 'dienstverhaeltnis_id':
                        case 'erste_dienstverhaeltnis_id':
                        case 'zweite_dienstverhaeltnis_id':
                                getDV( behebungParam[key] ).then((vb) => {
                                    let dienstverhaeltnis_id = behebungParam[key] + '';
                                    if (!('behebung_data' in issue)) {
                                        issue.behebung_data = { dvs: {} };                                
                                    }
                                    if (!('dvs' in issue.behebung_data)) {
                                        issue.behebung_data['dvs'] = {};
                                    }                            
                                    issue.behebung_data.dvs[dienstverhaeltnis_id] = vb.data;
                                })
                                break;
                        case 'vertragsbestandteil_id':
                        case 'erste_vertragsbestandteil_id':
                        case 'zweite_vertragsbestandteil_id':                            
                            getVB( behebungParam[key] ).then((vb) => {
                                let vertragsbestandteil_id = behebungParam[key] + '';
                                if (!('behebung_data' in issue)) {
                                    issue.behebung_data = { vbs: {} };                                
                                }
                                if (!('vbs' in issue.behebung_data)) {
                                    issue.behebung_data['vbs'] = {};
                                }                            
                                issue.behebung_data.vbs[vertragsbestandteil_id] = vb.data;
                            })
                            
                            break;
                        

                        case 'gehaltsbestandteil_id':
                            getGB( behebungParam[key] ).then((gb) => {
                                let gehaltsbestandteil_id = behebungParam[key] + '';
                                if (!('behebung_data' in issue)) {
                                    issue.behebung_data = { gbs: {} };                                
                                }
                                if (!('gbs' in issue.behebung_data)) {
                                    issue.behebung_data['gbs'] = {};
                                }                            
                                issue.behebung_data.gbs[gehaltsbestandteil_id] = gb.data;
                            })
                            break;
                    
                        default:
                            console.log('Behebungsparameter not supported', behebungParam);
                            break;
                    }
                })
            });

            
            
            return 66;
        }

        const isVB = (behebungParameter) => 'vertragsbestandteil_id' in behebungParameter
        
        const isGBT = (behebungParam) => 'gehaltsbestandteil_id' in behebungParameter
        

        watch(
			() => route.params,
			params => {
				currentPersonID.value = params.id;
               // currentPersonUID.value = params.uid;
               fetchIssues();
			}
		)

        // dummy events
        /* const issues = [
            {status: 'new', date: '1/2/2023', inhalt: 'lorem ipsum'},
            {status: 'new', date: '1/5/2023', inhalt: 'lorem ipsum'},
        ] */

        const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
        const fullPath = `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees/`;
      
        return {
            currentDate, isFetching, formatDate, title, currentPersonID, issues, fullPath, route, 
            formatVertragsbestandteiltyp, formatGehaltstyp,formatVertragsart,
        }
     },
     template: `
     <div class="card">
        <div class="card-header d-flex justify-content-between align-items-baseline">
            <h5 class="mb-0">{{ title }}</h5>
                <span class="text-muted">{{ formatDate(currentDate) }}</span>
        </div>
        <div class="card-body" style="text-align:left">
            <div v-if="isFetching" class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>     
            <div v-if="!isFetching && issues!=null">
                <table class="table table-bordered">
                    <tbody>
                        <tr><th>Datum</th><th>Inhalt</th></tr>                        
                        <tr v-for="(item, index) in issues" :key="item.issue_id">

                            <td>{{ formatDate(item.datum) }}</td>
                            <td>{{ item.inhalt }} <br>
                                <template v-if="item.behebung_data && item.behebung_data.vbs">
                                     <span v-for="(vb, index) in item.behebung_data.vbs" > 
                                            <router-link :to="fullPath + route.params.id + '/' + route.params.uid + '/contract/' + vb.dienstverhaeltnis_id" 
                                                class="flex-sm-fill text-sm-start">
                                                VB {{ formatVertragsbestandteiltyp(vb.vertragsbestandteiltyp_kurzbz) }} ({{ formatDate(vb.von) }} - {{ formatDate(vb.bis) }})
                                            </router-link>
                                        </span>
                                </template>
                                <template v-if="item.behebung_data && item.behebung_data.gbs">
                                     <span v-for="(gb, index) in item.behebung_data.gbs" > 
                                            <router-link :to="fullPath + route.params.id + '/' + route.params.uid + '/contract/' + gb.dienstverhaeltnis_id" 
                                                class="flex-sm-fill text-sm-start">
                                                GB {{ formatGehaltstyp(gb.gehaltstyp_kurzbz) }} ({{ formatDate(gb.von) }} - {{ formatDate(gb.bis) }})
                                            </router-link>
                                        </span>
                                </template>
                                <template v-if="item.behebung_data && item.behebung_data.dvs">
                                     <span v-for="(dv, index) in item.behebung_data.dvs" > 
                                            <router-link :to="fullPath + route.params.id + '/' + route.params.uid + '/contract/' + dv.dienstverhaeltnis_id" 
                                                class="flex-sm-fill text-sm-start">
                                                DV {{ formatVertragsart(dv.vertragsart_kurzbz) }}/{{ dv.unternehmen }} ({{ formatDate(dv.von) }} - {{ formatDate(dv.bis) }})
                                            </router-link>
                                        </span>
                                </template>
                            </td>
                            
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
     </div>
     
     `
   

}