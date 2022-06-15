const ContractExpiring = {
     props: {
        columns:  { type: Array, required: true },
        data: { type: Array, required: true},
     },
     setup( props ) {

        const currentSortKey = Vue.ref('name');
        const reverse = Vue.ref(false);
        const search = Vue.ref('');
        const currentSortMethod = Vue.ref('alphabetically');
        const columns = props.columns;
        const { data } = Vue.toRefs(props);

        const sortBy = (sortByKey) => {
            reverse.value = (currentSortKey.value == sortByKey) ? ! reverse.value : false;      
            currentSortKey.value = sortByKey;
            if (sortByKey == "personalnummer")
                currentSortMethod.value = "numeric"
            else if (sortByKey == "ende")          
                currentSortMethod.value = "date"      
            else 
                currentSortMethod.value = "alphabetically";
        }

        const filtered = Vue.computed(
            () => data.value?.filter(el => {
                return (el.name.toLowerCase().indexOf(search.value.toLowerCase().trim()) > -1
                    || el.personalnummer.toString().indexOf(search.value.trim()) > -1)
            })
        );

        const sorted = Vue.computed(() => {
            let sortedList = [...filtered.value];  // clone
            if (currentSortMethod.value == 'alphabetically') {
                sortedList = sortedList.sort((a,b) => {
                      let fa = a[currentSortKey.value].toLowerCase(), fb = b[currentSortKey.value].toLowerCase();
                      if (fa < fb) {
                          return reverse.value ? 1 : -1
                      }
                      if (fa > fb) {
                          return reverse.value ? -1 : 1
                      }
                      return 0
                  })
            } else if (currentSortMethod.value == 'numeric') {
                sortedList = sortedList.sort((a,b) => {
                      let fa = a[currentSortKey.value], fb = b[currentSortKey.value];
                      if (fa < fb) {
                          return reverse.value ? 1 : -1
                      }
                      if (fa > fb) {
                          return reverse.value ? -1 : 1
                      }
                      return 0
                })
            } else if (currentSortMethod.value == 'date') {
                sortedList = sortedList.sort((a,b) => {
                      let fa = new Date(a[currentSortKey.value]), fb = new Date(b[currentSortKey.value]);
                      if (fa < fb) {
                          return reverse.value ? 1 : -1
                      }
                      if (fa > fb) {
                          return reverse.value ? -1 : 1
                      }
                      return 0
                })
            }
            return sortedList;
        }) 

        const formatDate = (ds) => {
            var d = new Date(ds);
            return d.getDate()  + "." + (d.getMonth()+1) + "." + d.getFullYear()
        }

        const capitalize = (s) => {
            return s.charAt(0).toUpperCase() + s.slice(1);
        }
        
      
        return {
            data,columns,search,reverse,currentSortKey,filtered,formatDate,
            capitalize,

            sortBy, sorted
        }
     },
     template: `
        <input v-model="search" class="form-control" placeholder="Filter ">

        <table class="simpleSortableTable table table-striped">
            <thead>
            <tr>
                <th v-for="(column, index) in columns">
                    <a href="#" @click="sortBy(column)" :class=" { 'active' : currentSortKey == column}">
                        {{ capitalize(column) }}
                    </a>
                </th>
            </tr>
            </thead>

            <tbody>
            <tr v-for="(row, index) in sorted" >
                <td>{{ row.personalnummer }}</td>
                <td>{{ row.name }}</td>
                <td>{{ formatDate(row.beginn) }}</td>
                <td>{{ formatDate(row.ende) }}</td>                
            </tr>
            </tbody>
        </table>
        
     
     `
   

}