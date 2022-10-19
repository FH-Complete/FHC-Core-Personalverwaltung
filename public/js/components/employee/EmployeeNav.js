export const EmployeeNav = {
    props: {
        personID: Number,
        personUID: String,
    },
    setup(props, { emit }) {
        const route = VueRouter.useRoute();
        const close=() => {
            console.log("close", props.personID)
            emit("close-editor", props.personID)
        }

        const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
        const fullPath = `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees/`;
        return { close, route, fullPath }
    },
    template: `
    <nav
        class="nav nav-pills flex-column flex-sm-row ms-sm-auto col-lg-12 subnav"
    >
    
        <router-link :to="fullPath + personID + '/' + personUID + '/summary'" 
            class="flex-sm-fill text-sm-center nav-link"
            :class="[{'router-link-active active': route?.name === 'summary'}]" >
            Überblick
        </router-link>
        <router-link :to="fullPath + personID + '/' + personUID" 
            class="flex-sm-fill text-sm-center nav-link"
            :class="[{'router-link-active active': route?.name === 'person'}]" >
            Person
        </router-link>
        <router-link :to="'/index.ci.php/extensions/FHC-Core-Personalverwaltung/Employees/' + personID + '/' + personUID + '/contract'" 
            class="flex-sm-fill text-sm-center nav-link"
            :class="[{'router-link-active active': route.path.indexOf('contract') > -1 }]" >
            Verträge
        </router-link>
        <a
        class="flex-sm-fill text-sm-center nav-link"
        :href="fullPath + personID + '/' + personUID + '/salary'"
        >Gehalt</a
        >
        <a
        class="flex-sm-fill text-sm-center nav-link"
        :href="fullPath + personID + -'/' + personUID + '/time'"
        >Zeiten</a
        >
        <a
        class="flex-sm-fill text-sm-center nav-link"
        :href="fullPath + personID + '/' + personUID + '/lifecycle'"
        >Life Cycle</a
        >
        <a
        class="flex-sm-fill text-sm-center nav-link"
        :href="fullPath + personID + '/' + personUID + '/documents'"
        >Dokumente</a
        >
    </nav>
    
    `
}