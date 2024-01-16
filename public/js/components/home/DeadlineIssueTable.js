
  const DeadlineIssueTable = {    
    props: {
        fields: { type: Array, required: true},
        tabledata: {type: Array, required: true},
    },
    setup(props, { emit }){

        const protocol_host =
          location.protocol + "//" +
          location.hostname + ":" +
          location.port;

        const redirect = (issue_id) => {
          console.log('issue_id', person_id);
          emit('issueSelected', person_id);
          // window.location.href = `${protocol_host}/index.ci.php/extensions/FHC-Core-Personalverwaltung/Employees/summary?person_id=${person_id}`;
        }        

        return { redirect }
      },
    template: `
      <div id="master" class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-5 pb-2 mb-3">
                          
        <div class="flex-fill align-self-center">
          <h1 class="h2">Termine & Fristen</h1>
        </div>
    </div>

      <div id="collapseTable"  >
        <table id="tableComponent" class="table table-sm table-hover table-striped">
            <thead>
            <tr>
                <th> 
                  Ereignis
                </th>
                <th> 
                  To Do
                </th>
                <th> 
                  MitarbeiterIn
                </th>
                <th> 
                  Verantwortlich
                </th>
                <th> 
                  Fällig am
                </th>
                <th> 
                  Status
                </th>
            </tr>
            </thead>
            <tbody>
                <tr >
                  <td>
                    Diensteintritt
                  </td>
                  <td>
                    Daten zur Meldung freigeben
                  </td>
                  <td>
                    Cristina Hainberger
                  </td>
                  <td>
                    HR
                  </td>
                  <td>
                    Fällig am
                  </td>
                  <td>
                    
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
      </div>
    `
}