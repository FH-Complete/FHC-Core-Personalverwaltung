export const EmployeeStatus = {
    setup() {

        let statusList = Vue.ref([{text:'Fix',description:'fixangestellt'}, 
            {text:'Befristet',description:'befristet bis 30.6.2023'}, {text:'Karenz',description:'Elternkarenz bis 30.11.2023'}]);
        return {statusList};
    },
    template: `
    <div class="d-flex align-items-start ms-sm-auto col-lg-12  gap-2" >
      <template v-for="item in statusList">
        <!-- <span class="badge badge-lg bg-success me-2">BSP AKTIV</span><span class="badge bg-secondary me-2"> BSP FIX ANGESTELLT</span><span class="badge bg-secondary me-2">BSP STATUS</span> -->
        <span class="badge bg-secondary me-2">{{ item.text }}</span>
      </template>
    </div>   
   `
}
