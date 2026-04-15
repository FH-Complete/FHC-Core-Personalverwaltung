import { CoreFilterAPIs } from '../../../../js/components/filter/API.js';

let protocol_host = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;	 

export const searchbaroptions = {
    cssclass: "position-relative",
    origin: 'pv21',
    types: { 
		// cant access phrasen yet at this point in the setup
		person: 'Person',
		employee: 'Mitarbeiter',
		unassigned_employee: 'Mitarbeiter ohne Zuordnung',
		room: 'Raum',
		organisationunit: 'Organisationseinheit'
	},
    actions: {
		person: {
			defaultaction: {
				type: "link",
				action: function(data) {
					return data.profil;
				}
			},
			childactions: []
		},
		room: {
			defaultaction: {
				type: "link",
				renderif: function(data) {
					if(data.content_id === "N/A"){
						return false;
					}
					return true;
				},
				action: function(data) { 
					const link= FHC_JS_DATA_STORAGE_OBJECT.app_root +
						'cms/content.php?content_id=' + data.content_id;
					return link;
				}
			},
			childactions: [
				{
					label: "LV-Plan",
					icon: "fas fa-bookmark",
					type: "link",
					action: function(data) {
						const link = FHC_JS_DATA_STORAGE_OBJECT.app_root +
							'cis/private/lvplan/stpl_week.php?type=ort&ort_kurzbz=' + data.ort_kurzbz;
						return link;
					}
				},
				{
					label: "Rauminformation",
					icon: "fas fa-info-circle",
					type: "link",
					renderif: function(data) {
						if(data.content_id === "N/A"){
							return false;
						}
						return true;
					},
					action: function(data) {
					const link= FHC_JS_DATA_STORAGE_OBJECT.app_root +
						'cms/content.php?content_id=' + data.content_id;
						return link;
					}
				},
			]
		},
        employee: {
            defaultaction: {
                type: "link",
                action: (data) => {
                    return `${protocol_host}/extensions/FHC-Core-Personalverwaltung/Employees/${data.person_id}/${data.uid}/summary`;
                }
            },
            childactions: [
                {
                    label: "Dienstverhältnis",
                    icon: "fas fa-address-book",
                    type: "link",
                    action: function(data) {
                        return `${protocol_host}/extensions/FHC-Core-Personalverwaltung/Employees/${data.person_id}/${data.uid}/contract`;
                    }
                },
                {
                    label: "Stammdaten",
                    icon: "fas fa-address-card",
                    type: "link",
                    action: function(data) {
                        return `${protocol_host}/extensions/FHC-Core-Personalverwaltung/Employees/${data.person_id}/${data.uid}`;
                    }
                },
                {
                    label: "Vertragshistorie",
                    icon: "fas fa-address-book",
                    type: "link",
                    action: function(data) {
                        return `${protocol_host}/extensions/FHC-Core-Personalverwaltung/Employees/${data.person_id}/${data.uid}/contract#dvhistory`;
                    }
                }
            ]
        },
        organisationunit: {
            defaultaction: {
                type: "function",
                action: function(data) { 
                    //alert('organisationunit defaultaction ' + JSON.stringify(data));
                    const filterFields = {
                        "filterUniqueId":"extensions/FHC-Core-Personalverwaltung/Employees/index",
                        "filterType":"EmployeeViewer",
                        "filterFields":[{"name":"OE Key","operation":"equal","condition":data.oe_kurzbz}]
                    };
					let protocol_host = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
					axios.post(protocol_host + '/api/frontend/v1/filter/applyFilterFields', filterFields).then(function() {
                        // redirect
                        window.location.href = `${protocol_host}/extensions/FHC-Core-Personalverwaltung/Employees`;
                    });
                }
            },
            childactions: []
        }
    }
};
