export const EmployeeNav = {
    props: {
        //date: Date,
    },
    setup(props, { emit }) {
        const route = VueRouter.useRoute();
        const currentDate = Vue.ref(null);
        const close=() => {
            console.log("close", route.params.id)
            emit("close-editor", route.params.id)
        }
        Vue.onMounted(() => {
			console.log('EmployeeNav mounted', route.path);
            currentDate.value = route.query.d;
        })
        Vue.watch(
			() => route.query.d,
			d => {
                console.log('EmployeeNav watch route.query.d', d)
				currentDate.value = d;
			}
		)
        const maybeAddDate = () => {
            if (currentDate.value != null) {
                return '?d=' + currentDate.value;
            }
            return '';
        }

        const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
        const fullPath = `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees/`;
        return { close, route, fullPath, currentDate, maybeAddDate }
    },
    template: `    
    <nav
        class="nav nav-pills nav-justified flex-column flex-sm-row ms-sm-auto col-lg-12 subnav"
    >
    
        <router-link :to="fullPath + route.params.id + '/' + route.params.uid + '/summary' + maybeAddDate()" 
            class="flex-sm-fill text-sm-center nav-link"
            :class="[{'router-link-active active': route?.name === 'summary'}]" >
            Überblick
        </router-link>
        <router-link :to="fullPath + route.params.id + '/' + route.params.uid + maybeAddDate()" 
            class="flex-sm-fill text-sm-center nav-link"
            :class="[{'router-link-active active': route?.name === 'person'}]" >
            Person
        </router-link>
        <router-link :to="fullPath + route.params.id + '/' + route.params.uid + '/contract' + maybeAddDate()" 
            class="flex-sm-fill text-sm-center nav-link"
            :class="[{'router-link-active active': route.path.indexOf('contract') > -1 }]" >
            Dienstverhältnis
        </router-link>        
        <a
        class="flex-sm-fill text-sm-center nav-link"
        :href="fullPath + route.params.id + -'/' + route.params.uid + '/time' + maybeAddDate()"
        >Zeiten</a
        >
        <a
        class="flex-sm-fill text-sm-center nav-link"
        :href="fullPath + route.params.id + '/' + route.params.uid + '/lifecycle' + maybeAddDate()"
        >Life Cycle</a
        >
        <a
        class="flex-sm-fill text-sm-center nav-link"
        :href="fullPath + route.params.id + '/' + route.params.uid + '/documents'  + maybeAddDate() "
        >Dokumente</a
        >
    </nav>
    
    `
}