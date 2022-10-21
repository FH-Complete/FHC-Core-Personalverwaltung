export const EmployeeNav = {
    setup(props, { emit }) {
        const route = VueRouter.useRoute();
        const close=() => {
            console.log("close", route.params.id)
            emit("close-editor", route.params.id)
        }

        const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
        const fullPath = `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees/`;
        return { close, route, fullPath }
    },
    template: `
    <nav
        class="nav nav-pills nav-justified flex-column flex-sm-row ms-sm-auto col-lg-12 subnav"
    >
    
        <router-link :to="fullPath + route.params.id + '/' + route.params.uid + '/summary'" 
            class="flex-sm-fill text-sm-center nav-link"
            :class="[{'router-link-active active': route?.name === 'summary'}]" >
            Überblick
        </router-link>
        <router-link :to="fullPath + route.params.id + '/' + route.params.uid" 
            class="flex-sm-fill text-sm-center nav-link"
            :class="[{'router-link-active active': route?.name === 'person'}]" >
            Person
        </router-link>
        <router-link :to="'/index.ci.php/extensions/FHC-Core-Personalverwaltung/Employees/' + route.params.id + '/' + route.params.uid + '/contract'" 
            class="flex-sm-fill text-sm-center nav-link"
            :class="[{'router-link-active active': route.path.indexOf('contract') > -1 }]" >
            Verträge
        </router-link>
        <a
        class="flex-sm-fill text-sm-center nav-link"
        :href="fullPath + route.params.id + '/' + route.params.uid + '/salary'"
        >Gehalt</a
        >
        <a
        class="flex-sm-fill text-sm-center nav-link"
        :href="fullPath + route.params.id + -'/' + route.params.uid + '/time'"
        >Zeiten</a
        >
        <a
        class="flex-sm-fill text-sm-center nav-link"
        :href="fullPath + route.params.id + '/' + route.params.uid + '/lifecycle'"
        >Life Cycle</a
        >
        <a
        class="flex-sm-fill text-sm-center nav-link"
        :href="fullPath + route.params.id + '/' + route.params.uid + '/documents'"
        >Dokumente</a
        >
    </nav>
    
    `
}