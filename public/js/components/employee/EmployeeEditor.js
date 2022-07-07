import { EmployeePerson } from './EmployeePerson.js';
import { EmployeeHeader } from './EmployeeHeader.js';
import { EmployeeNav } from './EmployeeNav.js';

export default {
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
    setup( props, {emit }) {
        const redirect = (person_id) => {
            emit('personSelected', person_id);
        }
        return { redirect }
    },
    template: `      
        <EmployeeHeader v-if="open" :personID="personid" @person-selected="redirect" :edit-mode="true" ></EmployeeHeader> 
        <EmployeeNav v-if="open" :personID="personid" :edit-mode="true" ></EmployeeNav> 
        <employee-person v-if="open" :personid="personid"></employee-person>
    `
}