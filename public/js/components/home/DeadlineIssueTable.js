
  const DeadlineIssueTable = {    
    props: {
    },
    setup(props, { emit }){

        const isFetching = Vue.ref(false);
        const fristen = Vue.ref([]);

        const redirect = (issue_id) => {
          console.log('issue_id', person_id);
          emit('issueSelected', person_id);
          // window.location.href = `${protocol_host}/index.ci.php/extensions/FHC-Core-Personalverwaltung/Employees/summary?person_id=${person_id}`;
        }   
        
        const fetchList = async () => {
          try {
            let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router; 
                  
            const url = `${full}/extensions/FHC-Core-Personalverwaltung/api/getFristenListe`;
            isFetching.value = true;
            const res = await fetch(url)
            let response = await res.json();
            isFetching.value = false;              
            console.log(response);	  
            fristen.value = response;			  
          } catch (error) {
            console.log(error);
            isFetching.value = false;           
          }		
        }
    
        Vue.onMounted(() => {
            fetchList();
        })

        const onPersonSelect = (uid, person_id) => {
          let protocol_host = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;	
          window.location.href = `${protocol_host}/extensions/FHC-Core-Personalverwaltung/Employees/${person_id}/${uid}/summary`;
        }

        const formatDate = (d) => {
          if (d != null && d != '') {
          return d.substring(8, 10) + "." + d.substring(5, 7) + "." + d.substring(0, 4);
          } else {
              return ''
          }
        }

        return { onPersonSelect, fristen, formatDate }
      },
    template: `
      <div id="master" class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-5 pb-2 mb-3">
                          
        <div class="flex-fill align-self-center">
          <h1 class="h2">Termine & Fristen</h1>
        </div>
    </div>

      <div id="collapseTable"  >
        <table id="tableComponent" class="table table-sm table-hover table-striped" v-if="fristen != null && fristen.length > 0">
            <thead>
            <tr>
                <th scope="col" class="col-1"> 
                  Ereignis
                </th>
                <th scope="col" class="col-2"> 
                  MitarbeiterIn
                </th>
                <th scope="col" class="col-1"> 
                  Deadline
                </th>                                
                <th scope="col" class="col-2"> 
                  Verantwortlich
                </th>

                <th scope="col" class="col-2"> 
                  To Do
                </th>
                
                <th scope="col" class="col-1"> 
                  Status
                </th>
            </tr>
            </thead>
            <tbody>
                <tr v-for="frist in fristen" >
                  <td>
                    {{ frist.ereignis_bezeichnung }}
                  </td>
                  <td>
                    <a href="#" @click.prevent="onPersonSelect(frist.mitarbeiter_uid, frist.person_id)">
                    {{ frist.vorname }} {{ frist.nachname }}</a>
                  </td>
                  <td>
                    {{ formatDate(frist.datum) }}
                  </td>
                  
                  
                  <td>
                  <a href="#" @click.prevent="onPersonSelect(frist.verantwortlich_uid, frist.verantwortlich_person_id)">
                  {{ frist.verantwortlich_vorname }} {{ frist.verantwortlich_nachname }}</a>
                  </td>

                  <td>
                    {{ frist.bezeichnung }}
                  </td>
                  
                  <td>
                    {{ frist.status_bezeichnung }}
                  </td>
                  <td>
                    <div class="d-grid gap-2 d-md-flex ">
                        <!--button type="button" class="btn btn-outline-dark btn-sm">
                            <i class="fa fa-minus"></i>
                        </button-->
                        <button type="button" class="btn btn-outline-dark btn-sm" @click="redirect(item['person_id'])">
                            <i class="fa fa-eye"></i>
                        </button>
                    </div>
                  </td>
                </tr>
            </tbody>
        </table> 
        <div v-else>0 Datensätze vorhanden.</div>
      </div>
    `
}