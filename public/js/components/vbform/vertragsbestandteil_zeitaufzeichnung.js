import gueltigkeit from './gueltigkeit.js';
import configurable from '../../mixins/vbform/configurable.js';
import errors from './errors.js';
import infos from './infos.js';
import store from './vbsharedstate.js';

export default {
  name: 'VertragsbestandteilZeitaufzeichnung',
  template: `
  <div class="py-0 my-2">
   <div class="py-0">
    <infos :infos="(config?.guioptions?.infos !== undefined) ? config?.guioptions?.infos : []"></infos>
    <errors :errors="(config?.guioptions?.errors !== undefined) ? config?.guioptions?.errors : []"></errors>
    <div class="row g-2" style="padding-right: 1rem;">
      <div class="col-2">
        <div class="form-check form-control-sm">
            <input v-model="zeitaufzeichnung" :disabled="isinputdisabled('zeitaufzeichnung')" class="form-check-input" type="checkbox" value="" :id="'zeitaufzeichnung_' + config.guioptions.id">
            <label class="form-check-label" :for="'zeitaufzeichnung_' + config.guioptions.id">
              Zeitaufzeichnung
            </label>
        </div>
      </div>
      <div class="col-2">
        <div class="form-check form-control-sm">
            <input v-model="azgrelevant" :disabled="isinputdisabled('azgrelevant')" class="form-check-input" type="checkbox" value="" :id="'azgrelevant_' + config.guioptions.id">
            <label class="form-check-label" :for="'azgrelevant_' + config.guioptions.id">
              AZG-relevant
            </label>
        </div>
      </div>
      <div class="col-2">
        <div class="form-check form-control-sm">
            <input v-model="homeoffice" :disabled="isinputdisabled('homeoffice')" class="form-check-input" type="checkbox" value="" :id="'homeoffice_' + config.guioptions.id">
            <label class="form-check-label" :for="'homeoffice_' + config.guioptions.id">
              Home-Office
            </label>
        </div>
      </div>
      <div class="col-1 form-check form-control-sm">&nbsp;</div>
      <gueltigkeit ref="gueltigkeit" :config="getgueltigkeit" @markended="markGBsEnded"></gueltigkeit>
      <div class="col-1 pe-3">
        <span v-if="db_delete" class="badge bg-danger">wird gelöscht</span>
        <button v-if="isremoveable" type="button" class="btn-close btn-sm p-2 float-end" @click="removeVB" aria-label="Close"></button>
        <button v-if="isdeleteable" type="button" class="btn btn-sm p-2 float-end" @click="toggledelete" aria-label="Delete"><i v-if="db_delete" class="fas fa-trash-restore"></i><i v-else="" class="fas fa-trash"></i></button>
      </div>      
    </div>  <!-- row -->
    <div class="row g-2" style="padding-right: 1rem;">
        <div class="col-4">          
              <p-autocomplete 
                v-model="autocomplete.selectedzeitmodell" 
                dropdown
                dropdownMode="current" 
                :suggestions="autocomplete.zeitmodelle" 
                @complete="searchZeitmodell"
                optionLabel="label"
                optionDisabled="disabled"
                forceSelection
                :disabled="isinputdisabled('zeitmodell_id')"
                :placeholder="getZeitmodellDropdownPlaceholder"
            ></p-autocomplete>
        </div>
        <div class="col-8"></div>
    </div>  <!-- row -->
   </div>
  </div>
  `,
  components: {
    'gueltigkeit': gueltigkeit,
    'infos': infos,
    'errors': errors,
    'p-autocomplete': primevue.autocomplete
  },
  mixins: [
    configurable
  ],
  inject: ['zeitmodelle'],
  emits: {
    removeVB: null
  },
  data: function () {
    return {
      id: null,
      zeitaufzeichnung: true,
      azgrelevant: true,
      homeoffice: true,
      zeitmodell_id: null,
      db_delete: false,
      lists: {
        zeitmodelle: []
      },
      autocomplete: {
        zeitmodelle: [],
        selectedzeitmodell: ''
      },
      store: store
    };
  },
  created: function() {
    const zeitmodelle = [
        {
            value: null,
            label: 'Bitte Zeitmodell wählen'
        },
        ...this.zeitmodelle
    ];
    this.lists.zeitmodelle = zeitmodelle;

    this.setDataFromConfig();
    this.autocomplete.zeitmodelle = [...this.lists.zeitmodelle];
    this.setAutocompleteZeitmodell();
  },
  watch: {
    'autocomplete.selectedzeitmodell': function() {
        if(this.autocomplete.selectedzeitmodell?.value !== undefined) {
          this.zeitmodell_id = this.autocomplete.selectedzeitmodell.value;
        } else {
          this.zeitmodell_id = null;
        }
      },
  },computed: {
      getZeitmodellDropdownPlaceholder: function() {
          let stunden = null;
          Object.entries(this.store.vbs).forEach(([key, value]) => {
              if (value.type == 'vertragsbestandteilstunden') {
                  console.log(`key= ${key} value = ${value}`)
                  stunden = value.data.stunden;
              }              
          })
          if( stunden === null ) {
            return 'Bitte zuerst ein Stunden/Woche eingeben';
          } else {
            console.log("stunden=",stunden)
          }
          return 'Zeitmodell wählen';
      },      
  },
  methods: {
    isselected: function(optvalue, selvalue) {
      return (optvalue === selvalue);
    },
    resetDropdowns: function() {
      if(!this.isinputdisabled('zeitmodell_id')) {
        this.autocomplete.selectedzeitmodell = null;
      }
      this.zeitmodell_id = null;
    },
    setDataFromConfig: function() {
      if( this.config?.data?.id !== undefined ) {
        this.id = this.config.data.id;
      }
      if( this.config?.data?.zeitaufzeichnung !== undefined ) {
        this.zeitaufzeichnung = this.config.data.zeitaufzeichnung;
      }
      if( this.config?.data?.azgrelevant !== undefined ) {
        this.azgrelevant = this.config.data.azgrelevant;
      }
      if( this.config?.data?.homeoffice !== undefined ) {
        this.homeoffice = this.config.data.homeoffice
      }
      if( this.config?.data?.zeitmodell_id !== undefined ) {
        this.zeitmodell_id = this.config.data.zeitmodell_id;
      }
      if( this.config?.data?.db_delete !== undefined ) {
        this.db_delete = this.config.data.db_delete;
      }
    },
    setAutocompleteZeitmodell: function() {
        if( !!this.zeitmodell_id && this.autocomplete.zeitmodelle.length > 0 ) {
          var that = this;
          this.autocomplete.selectedzeitmodell = this.autocomplete.zeitmodelle.find((item) => {
              return that.zeitmodell_id === item.value;
          });
        }
    },
    searchZeitmodell: function(event) {
        var that = this;
        
        setTimeout(function() {
            if (!event.query.trim().length) {
                that.autocomplete.zeitmodelle = [...that.lists.zeitmodelle];
            } else {
                that.autocomplete.zeitmodelle = that.lists.zeitmodelle.filter((item) => {
                    return item.label.toLowerCase().includes(event.query.toLowerCase());
                });
            }
        }, 250);
    },
    removeVB: function() {
      this.$emit('removeVB', {id: this.config.guioptions.id});
    },
    getPayload: function() {
      return {
        type: this.config.type,
        guioptions: this.config.guioptions,
        data: {
          id: this.id,
          zeitaufzeichnung: Boolean(this.zeitaufzeichnung),
          azgrelevant: Boolean(this.azgrelevant),
          homeoffice: Boolean(this.homeoffice),
          zeitmodell_id: this.zeitmodell_id,
          db_delete: this.db_delete,
          gueltigkeit: this.$refs.gueltigkeit.getPayload()
        }
      };
    }
  }
}
