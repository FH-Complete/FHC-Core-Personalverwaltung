/**
 * @deprecated replaced by filter widget
 */
const EmployeeChooser = {
  props: {
    placeholder: String,
  },
  emits: ["person_selected"],
  setup(_, { emit }) {   

    var protocol_host =
        location.protocol + "//" +
        location.hostname + ":" +
        location.port;

    const endpoint =
      protocol_host +
      "/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/filter";
    let url = "";

    const searchString = Vue.ref("");
    const showDropDown = Vue.ref(false);
    const maList = Vue.ref([]);
    const isFetching = Vue.ref(false);

    const hideDropDown = () => {
      searchString.value = "";
      maList.value = [];
      showDropDown.value = false;
    };

    const submit = () => {
      search();
    };

    const selectItem = (person_id) => {
      console.log("selected: ", person_id);
      hideDropDown();
      emit("person_selected", person_id);
      window.location.href = `${protocol_host}/index.ci.php/extensions/FHC-Core-Personalverwaltung/Employees/summary?person_id=${person_id}`;
    };

    const generateImageLink = (person_id) => {
      return `${protocol_host}/index.ci.php/extensions/FHC-Core-Personalverwaltung/apis/v1/PersonAPI/foto?person_id=${person_id}`;
    };

    const keyUp = () => {
      url = `${endpoint}?search=${encodeURIComponent(searchString.value)}`;
      console.log("url", url);
    };

    const search = async () => {
      isFetching.value = true
      try {
        const res = await fetch(url)
        let response = await res.json()
        maList.value = response.retval;
        isFetching.value = false
        showDropDown.value = true
      } catch (error) {
        console.log(error)
        isFetching.value = false
      }
    }

    return {

      // vars
      maList,      
      isFetching,
      searchString,
      showDropDown,
      
      // functions
      keyUp,
      selectItem,      
      submit,
      hideDropDown,
      generateImageLink,
    }

  },
  template: `  
  <div class="input-group flex-nowrap">
    <input
      class="form-control form-control-dark w-100"
      type="text"
      v-model="searchString"
      :placeholder="placeholder"
      :aria-label="placeholder"
      @keydown.esc="hideDropDown()"
      @keyup.enter="submit()"
      @keyup="keyUp()"
    />
    <span
      v-if="isFetching"
      class="input-group-text form-control-dark"
      id="addon-wrapping"
    >
      <span
        style="border-radius: 50%"
        class="spinner-border spinner-border-sm"
        role="status"
        aria-hidden="true"
      ></span>
    </span>
    <span
      v-if="!isFetching"
      class="input-group-text form-control-dark"
      id="addon-search-wrapping"
    >
      <svg
        width="16"
        height="20"
        class="DocSearch-Search-Icon"
        viewBox="0 0 20 20"
      >
        <path
          d="M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z"
          stroke="currentColor"
          fill="none"
          fill-rule="evenodd"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </svg>
    </span>
  </div>

  <ul id="sdropdown" class="dropdown-menu" :class="{ show: showDropDown }">
    <li
      v-for="ma in maList"
      :key="ma.person_id"
      @click="selectItem(ma.person_id)"
    >
      <a
        class="dropdown-item"
        href="#"
        style="display: grid; grid-template-columns: 100px 1fr 1fr"
      >
        <div class="searchResultItem">
          <div class="searchResultCell foto">
            <img
              :src="generateImageLink(ma.person_id)"
              src-placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAACCCAIAAAA/nfqcAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAx0lEQVR42u3QMQEAAAgDILV/rAWzgp8PRKCTFDejQJYsWbJkyVIgS5YsWbJkKZAlS5YsWbIUyJIlS5YsWQpkyZIlS5YsBbJkyZIlS5YCWbJkyZIlS4EsWbJkyZKlQJYsWbJkyVIgS5YsWbJkKZAlS5YsWbIUyJIlS5YsWQpkyZIlS5YsBbJkyZIlS5YCWbJkyZIlS4EsWbJkyZKlQJYsWbJkyVIgS5YsWbJkKZAlS5YsWbIUyJIlS5YsWQpkyZIlS5YsBbJkfVtg0QNQk38YvgAAAABJRU5ErkJggg=="
              style="max-width: 100px"
              loading="lazy"
            />
          </div>
          <div class="searchResultCell">
            <div class="searchResultName">
              {{ ma.nachname }}, {{ ma.vorname }} {{ ma.titelpre }} ({{
                ma.personalnummer
              }})
            </div>
            <table>
              <tr>
                <th>Tel</th>
                <td>{{ ma.telefonklappe }}</td>
              </tr>
              <tr>
                <th>Mail</th>
                <td>
                  <a href="mailto:{{ ma.email }}">{{ ma.email }}</a>
                </td>
              </tr>
              <tr>
                <th>Office</th>
                <td>{{ ma.office }}</td>
              </tr>
            </table>
          </div>
          <div class="searchResultCell">
            <br />
            <table>
              <tr>
                <th>Abteilung</th>
                <td>{{ ma.department }}</td>
              </tr>
              <tr>
                <th>Funktion</th>
                <td>{{ ma.jobtitle }}</td>
              </tr>
              <tr>
                <th>Vorgesetzter</th>
                <td>{{ ma.supervisor }}</td>
              </tr>
            </table>
          </div>
        </div>
      </a>
    </li>
  </ul>
  `
}

