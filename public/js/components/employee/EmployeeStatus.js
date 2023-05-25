export const EmployeeStatus = {
    setup() {

        let statusList = Vue.ref([{text:'Fix',description:'fixangestellt'}, 
            {text:'Befristet',description:'befristet bis 30.6.2023'}, {text:'Karenz',description:'Elternkarenz bis 30.11.2023'}]);
        return {statusList};
    },
    template: `
    <template v-for="item in statusList">
        <div class="d-flex flex-column align-items-center" >
            <div style="font-weight:bold;font-size:1.3rem">{{ item.text }}</div><div style="font-size:0.75em;color:#666">{{ item.description }}</div>
            
        </div> 
        <div class="vr"></div>  
    </template>
   `
}
