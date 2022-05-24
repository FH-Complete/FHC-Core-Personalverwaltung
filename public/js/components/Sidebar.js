const Sidebar = {
    props: {
      active: Number,
    },
    setup() {   
        const links = [ {
                url: '/index.ci.php/extensions/FHC-Core-Personalverwaltung/Home ',
                label: 'Home',
                icon: 'fa-dashboard',
            },
            {
                url: '/index.ci.php/extensions/FHC-Core-Personalverwaltung/Employees',
                label: 'Mitarbeiter',
                icon: 'fa-user-group',
            },
            {
                url: '/index.ci.php/extensions/FHC-Core-Personalverwaltung/Organisation',
                label: 'Organisation',
                icon: 'fa-sitemap',
            },
            {
                url: '/index.ci.php/extensions/FHC-Core-Personalverwaltung/Reports',
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
