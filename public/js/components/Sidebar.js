const Sidebar = {
    props: {
      active: Number,
    },
    setup() {   

        let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
        const links = [ {
                url: full + '/extensions/FHC-Core-Personalverwaltung/Home ',
                label: 'Home',
                icon: 'fa-dashboard',
            },
            {
                url: full + '/extensions/FHC-Core-Personalverwaltung/Employees',
                label: 'Mitarbeiter',
                icon: 'fa-user-group',
            },
            {
                url: full + '/extensions/FHC-Core-Personalverwaltung/Organisation',
                label: 'Organisation',
                icon: 'fa-sitemap',
            },
            {
                url: full + '/extensions/FHC-Core-Personalverwaltung/Reports',
                label: 'Berichte',
                icon: 'fa-chart-pie',
            }
        ];
        return { links };
    },
    template: `  
        <nav id="sidebarMenu" class="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
            <div class="position-sticky pt-3">
                <ul class="nav flex-column">
                    <li
                        class="nav-item"
                        v-for="(item, index) in links"
                        :key="index"
                    >
                            <a class="nav-link " :class="{ active: index==active }" aria-current="page" :href="item.url">
                            <i class="feather fa fa-fw" :class="item.icon"></i>
                            {{ item.label }}
                        </a>
                    </li>
                </ul>
            
            </div>
        </nav>
    `
}
