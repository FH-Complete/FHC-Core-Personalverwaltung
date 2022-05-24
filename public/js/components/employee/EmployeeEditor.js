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
    setup(props, { emit }) {
        const close=() => {
            console.log("close", props.personid)
            emit("close-editor", props.personid)
        }

        return { close }
    },
    template: `
        <div v-if="open" class="d-grid gap-2 d-md-flex mt-1 justify-content-end">            
            <button type="button" @click="close" class="btn btn-outline-secondary " style="border-radius: 50%;width: 40px;height: 40px;"><i class="fa fa-xmark"></i></button>
        </div>      
        <EmployeeHeader v-if="open" :personID="personid" :edit-mode="true" ></EmployeeHeader> 
        <EmployeeNav v-if="open" :personID="personid" :edit-mode="true" ></EmployeeNav> 
        <employee-person v-if="open" :personid="personid"></employee-person>
    `
}