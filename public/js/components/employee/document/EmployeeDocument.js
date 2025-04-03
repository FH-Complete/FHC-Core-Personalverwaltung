

export const EmployeeDocument = {
	name: 'EmployeeDocument',
    components: {
 
    },
    props: {
    },
    setup() {


        const route = VueRouter.useRoute();
        const { watch, ref, onMounted } = Vue; 
        const currentPersonID = ref(null);
        const currentUID = ref(null);
        const isFetching = ref(false);

        onMounted(() => {
            currentPersonID.value = parseInt(route.params.id);
            currentUID.value = route.params.uid;
        })

        watch(
			() => route.params.id,
			newId => {
				currentPersonID.value = parseInt(newId);
			}
		)

        watch(
			() => route.params.uid,
			newId => {
				currentUID.value = newId;
			}
		)


        return {currentPersonID, currentUID, isFetching}
    },
    template: `
    <div class="d-flex justify-content-between align-items-center ms-sm-auto col-lg-12 p-md-2">
      <div class="container-fluid px-1">

            <div class="row">                

                <div class="row pt-md-4">

                    work in progress...

                    
                </div>            

            </div>                      
        </div>

    </div>

    `
}