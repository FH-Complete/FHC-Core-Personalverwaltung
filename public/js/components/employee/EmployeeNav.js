export const EmployeeNav = {
    props: {
        personID: Number,
    },
    setup(props, { emit }) {
        const route = VueRouter.useRoute();
        const close=() => {
            console.log("close", props.personid)
            emit("close-editor", props.personid)
        }

        const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
        const fullPath = `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees/`;
        return { close, route, fullPath }
    },
    template: `
    <nav
        class="nav nav-pills flex-column flex-sm-row ms-sm-auto col-lg-12 subnav"
    >
        <a
            class="flex-sm-fill text-sm-center nav-link"
            aria-current="page"
            :href="full"
        >Überblick</a
        >     
        <router-link :to="fullPath + personID" 
            class="flex-sm-fill text-sm-center nav-link"
            :class="[{'router-link-active active': route?.name === 'person'}]" >
            Person
        </router-link>
        <router-link :to="'/index.ci.php/extensions/FHC-Core-Personalverwaltung/Employees/' + personID + '/contract'" 
            class="flex-sm-fill text-sm-center nav-link"
            :class="[{'router-link-active active': route.path.indexOf('contract') > -1 }]" >
            Verträge
        </router-link>
        <a
        class="flex-sm-fill text-sm-center nav-link"
        :href="fullPath + personID + '/salary'"
        >Gehalt</a
        >
        <a
        class="flex-sm-fill text-sm-center nav-link"
        :href="fullPath + personID + '/time'"
        >Zeiten</a
        >
        <a
        class="flex-sm-fill text-sm-center nav-link"
        :href="fullPath + personID + '/lifecycle'"
        >Life Cycle</a
        >
        <a
        class="flex-sm-fill text-sm-center nav-link"
        :href="fullPath + personID + '/documents'"
        >Dokumente</a
        >
    </nav>
    
    `
}