import fhcapifactory from "../../../../js/apps/api/fhcapifactory.js";
import { CoreFilterAPIs } from '../../../../js/components/filter/API.js';

Vue.$fhcapi = fhcapifactory;

let protocol_host = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;	 

export const searchbaroptions = {
    types: [
        "person",
        "raum",
        "mitarbeiter",
        "mitarbeiter_ohne_zuordnung",
        "student",
        "prestudent",
        "document",
        "cms",
        "organisationunit"
    ],
    actions: {
        person: {
            defaultaction: {
                type: "link",
                action: function(data) { 
                    return data.profil;
                }
            },
            childactions: [
                {
                    label: "testchildaction1",
                    icon: "fas fa-check-circle",
                    type: "function",
                    action: function(data) { 
                        alert('person testchildaction 01 ' + JSON.stringify(data)); 
                    }
                },
                {
                    label: "testchildaction2",
                    icon: "fas fa-file-csv",
                    type: "function",
                    action: function(data) { 
                        alert('person testchildaction 02 ' + JSON.stringify(data)); 
                    }
                }
            ]
        },
        raum: {
            defaultaction: {
                type: "function",
                action: function(data) { 
                    alert('raum defaultaction ' + JSON.stringify(data)); 
                }
            },
            childactions: [                      
               {
                    label: "Rauminformation",
                    icon: "fas fa-info-circle",
                    type: "link",
                    action: function(data) { 
                        return data.infolink;
                    }
                },
                {
                    label: "Raumreservierung",
                    icon: "fas fa-bookmark",
                    type: "link",
                    action: function(data) { 
                        return data.booklink;
                    }
                }
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
/*
                {
                    label: "testchildaction3",
                    icon: "fas fa-bell",
                    type: "function",
                    action: function(data) { 
                        alert('employee testchildaction 03 ' + JSON.stringify(data)); 
                    }
                },
                {
                    label: "testchildaction4",
                    icon: "fas fa-calculator",
                    type: "function",
                    action: function(data) { 
                        alert('employee testchildaction 04 ' + JSON.stringify(data)); 
                    }
                }
 */
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
                    CoreFilterAPIs.applyFilterFields(filterFields).then(function() {
                        // redirect
                        let protocol_host = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
                        window.location.href = `${protocol_host}/extensions/FHC-Core-Personalverwaltung/Employees`;
                    });
                }
            },
            childactions: []
        }
    }
};

export const searchfunction = (searchsettings) =>  {
    return Vue.$fhcapi.Search.search(searchsettings);  
};

export const searchfunctiondummy = (searchsettings) => {
    return Vue.$fhcapi.Search.searchdummy(searchsettings);  
};
