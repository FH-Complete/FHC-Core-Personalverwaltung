const EmployeeEditor = {
    components: {
        EmployeePerson,
        EmployeeHeader,
        EmployeeNav,
    },
    props: {
        personid: Number,
        open: Boolean,
        isNew:  Boolean        
    },
    setup() {

    },
    template: `      
        <EmployeeHeader v-if="open" :personID="personid" :edit-mode="true" ></EmployeeHeader> 
        <EmployeeNav v-if="open" :personID="personid" :edit-mode="true" ></EmployeeNav> 
        <employee-person v-if="open" :personid="personid"></employee-person>
    `
}