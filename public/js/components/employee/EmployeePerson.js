const EmployeePerson = {
    components: {
		BaseData,
		EmployeeData,
		BankData,
		ContactData,
        EmailTelData,
        MaterialExpensesData,
	},	
    props: {
        personid: { type: Number, default: 0 }
    },
    setup() {

        const items = ["base", "employee", "contact", "bank", "material"];
        const activeItem = Vue.ref("base");
       // const { personID } = Vue.toRefs(props);

        const isActive = (menuItem) => {
             return activeItem.value === menuItem;
        };

        const setActive = (menuItem) => {
            activeItem.value = menuItem;
            console.log("activeItem: ", menuItem);
        };

       // console.log('EmployeeSubMenu: personID', props.personID);

        return { items, isActive, setActive }

    },
    template: `
    <div class="d-flex justify-content-between align-items-center col-md-9 ms-sm-auto col-lg-12 p-md-2">
      <div class="container-fluid">
        <div class="row pt-md-2">
            
            <nav class="nav flex-column col-md-2 subsubnav">
                <a
                    class="nav-link"
                    :class="{ active: isActive(items[0]) }"
                    @click.prevent="setActive(items[0])"
                    href="#base"
                >Stammdaten</a
                >
                <a
                    class="nav-link"
                    :class="{ active: isActive(items[1]) }"
                    @click.prevent="setActive(items[1])"
                    href="#employee"
                    >Mitarbeiterdaten</a
                >
                <a
                    class="nav-link"
                    :class="{ active: isActive(items[2]) }"
                    @click.prevent="setActive(items[2])"
                    href="#contact"
                    >Kontaktdaten</a
                >
                <a
                    class="nav-link"
                    :class="{ active: isActive(items[3]) }"
                    @click.prevent="setActive(items[3])"
                    href="#bank"
                    >Bankdaten</a
                >
                <a
                    class="nav-link"
                    :class="{ active: isActive(items[4]) }"
                    @click.prevent="setActive(items[4])"
                    href="#bank"
                    >Sachaufwand</a
                >
            </nav>
            <div class="tab-content col-md-10" id="nav-tabContent">
                <div
                    class="tab-pane"
                    :class="{ active: isActive(items[0]) }"
                    role="tabpanel"
                >
                    <base-data editMode :personID="personid" ></base-data>
                </div>
                <div
                    class="tab-pane"
                    :class="{ active: isActive(items[1]) }"
                    role="tabpanel"
                >
                <employee-data editMode :personID="personid"></employee-data>
                </div>
                <div
                    class="tab-pane"
                    :class="{ active: isActive(items[2]) }"
                    role="tabpanel"
                >
                    <contact-data editMode :personID="personid"></contact-data>
                </div>
                <div
                    class="tab-pane"
                    :class="{ active: isActive(items[3]) }"
                    role="tabpanel"
                >
                <bank-data editMode :personID="personid"></bank-data>
                </div>
                <div
                    class="tab-pane"
                    :class="{ active: isActive(items[4]) }"
                    role="tabpanel"
                >
                <material-expenses-data editMode :personID="personid"></material-expenses-data>
                </div>
                
            </div>
        </div>
      </div>
    </div>
    `

}