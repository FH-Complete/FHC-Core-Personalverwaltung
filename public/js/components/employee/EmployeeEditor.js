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
        <EmployeeHeader  :personID="personid" @person-selected="redirect" :edit-mode="true" ></EmployeeHeader> 
        <EmployeeNav  :personID="personid" :edit-mode="true" ></EmployeeNav> 
        <employee-person  :personid="personid"></employee-person>
    `
}