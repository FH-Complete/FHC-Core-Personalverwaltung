
        

const EmployeeTable = {    
    props: {
        fields: { type: Array, required: true},
        tabledata: {type: Array, required: true},
        minimized: { type: Boolean, required: true}
    },
    setup(props, { emit }){

        const collapsed = Vue.ref(false);

        const collapseBtn = Vue.ref(null);

        const protocol_host =
          location.protocol + "//" +
          location.hostname + ":" +
          location.port;

        const redirect = (person_id) => {
          console.log('person_id', person_id);
          emit('personSelected', person_id);
          // window.location.href = `${protocol_host}/index.ci.php/extensions/FHC-Core-Personalverwaltung/Employees/summary?person_id=${person_id}`;
        }

        const toggle = () => {
          collapsed.value = !collapsed.value;
        }

        Vue.watch(() => props.minimized, (newVal) => {
          console.log('minimized: ', props.minimized);
          if (collapseBtn.value.classList.contains('collapsed')) {
            collapseBtn.value.click();
          }
        })

        return { redirect, toggle, collapsed, collapseBtn }
      },
    template: `
      <div id="master" class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                        
        <div class="flex-fill align-self-center">
          <h1 class="h2" style="margin-bottom:0" data-bs-toggle="collapse" data-bs-target="#collapseTable" aria-expanded="true" aria-controls="collapseTable"> Mitarbeiter</h1>
        </div>
        <div class="btn-toolbar mb-2 mb-md-0">
            <button type="button" class="btn btn-outline-secondary" style="border-radius: 50%;width: 40px;height: 40px;"><i class="fa fa-plus"></i></button>
            <button type="button" id="collapseBtn" ref="collapseBtn" class="btn btn-sm btn-outline-secondary collapsebtn " :class="{ 'collapsed': collapsed } " data-bs-toggle="collapse" data-bs-target="#collapseTable" aria-expanded="true" aria-controls="collapseTable" style="border-radius: 50%;width: 40px;height: 40px;margin-left:5px" ><i class="fa fa-chevron-down"></i></button>
        </div>
      </div>

      <div class="collapse " :class="{ 'minimized': minimized, 'show': collapsed===false}" id="collapseTable"  >
        <table id="tableComponent" class="table table-sm table-hover table-striped">
            <thead>
            <tr>
                <!-- loop through each value of the fields to get the table header -->
                <th  v-for="field in fields" :key='field' @click="sortTable(field)" > 
                {{field}} <i class="bi bi-sort-alpha-down" aria-label='Sort Icon'></i>
                </th>
            </tr>
            </thead>
            <tbody>
                <!-- Loop through the list get the each student data -->
                <tr v-for="item in tabledata" :key='item' >
                <td v-for="field in fields" :key='field' class="align-middle">
                  <span v-if="field=='nachname'" style="font-weight:bold">{{item[field]}}</span>
                  <span v-else>{{item[field]}}</span>
                </td>
                <td>
                  <div class="d-grid gap-2 d-md-flex ">
                      <button type="button" class="btn btn-outline-dark btn-sm">
                          <i class="fa fa-minus"></i>
                      </button>
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