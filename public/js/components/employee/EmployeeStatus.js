export const EmployeeStatus = {
    setup() {

        let statusList = Vue.ref([{text:'Fix',description:'fixangestellt'}, 
            {text:'Befristet',description:'befristet bis 30.6.2023'}, {text:'Karenz',description:'Elternkarenz bis 30.11.2023'}]);
        return {statusList};
    },
    template: `
    <template v-for="item in statusList">
        <div class="d-flex flex-column align-items-center" >
            <span class="badge bg-secondary">{{ item.text }}</span>
        </div> 
        
    </template>
   `
}
