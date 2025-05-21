import PersonFunctions from "../../../../../js/components/Funktionen/Funktionen.js";

export default {
	components: {
		PersonFunctions,
	},
	props: {
		modelValue: Object,
	},
	methods: {
		formatCompanyLink(cell) {

			if(cell.getValue() === null)
			{
				return "";
			}
			const id = cell.getRow().getData().dienstverhaeltnis_id;
			const person_id = this.modelValue.personID;
			const person_uid = this.modelValue.personUID;

			const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
			const fullPath = `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees`;

			return `<a href="${fullPath}/${person_id}/${person_uid}/contract/${id}">${cell.getValue()}</a>`;
		}
	},
	template: `
    <div class="row pt-md-4">      
         <div class="col">
             <div class="card">
                <div class="card-header">
                    <div class="h5"><h5>{{ $p.t('stv', 'tab_functions') }}</h5></div>        
                </div>

                <div class="card-body">
                                            
                    <person-functions
                        :readonlyMode="!modelValue.editmode"
                        :personID="modelValue.personID"
                        :personUID="modelValue.personUID"
                        :showDvCompany="true"
                        :saveFunctionAsCopy="false"                   
                        :stylePv21="true"
                        :companyLinkFormatter="formatCompanyLink"
                    >
                    </person-functions>
                
                </div>
             </div>
         </div>
    </div>
    
    `,
};
