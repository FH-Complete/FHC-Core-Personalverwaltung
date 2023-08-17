const IssuesCountCard = {
     props: {
     },
     setup( props ) {
        
        const isFetching = Vue.ref(false);
        const title = Vue.ref("Mitarbeiter*innen mit Issues");
        const issues = Vue.ref([]);

        const getOpenIssues = async () =>  {
            try {
                let res = await Vue.$fhcapi.Issue.openIssuesPersons();
                issues.value = res.data.retval;
                console.log(res);
                return res;
            } catch(error) {
                console.log(error);
            }
            return null;
        }

        Vue.onMounted(() => {
            getOpenIssues();
        })
      
        return {
           issues, isFetching, title,
        }
     },
     template: `
     <div class="card">
        <div class="card-header">
            <h5 class="mb-0">{{ title }}</h5>
                &nbsp;
            </div>
            <div class="card-body" style="text-align:center">
            <div v-if="isFetching" class="spinner-border" role="status">
                 <span class="visually-hidden">Loading...</span>
            </div>            
            <h3 v-if="!isFetching">{{ issues?.length }}</h3>
        </div>
     </div>
     
     `
   

}