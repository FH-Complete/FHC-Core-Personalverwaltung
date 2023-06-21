import gueltigkeit from './gueltigkeit.js';
import configurable from '../../mixins/vbform/configurable.js';
import errors from './errors.js';
import infos from './infos.js';
import store from './vbsharedstate.js';

export default {
  template: `
  <div class="py-2" :class="vbcssclasses">
    <infos :infos="(config?.guioptions?.infos !== undefined) ? config.guioptions.infos : []"></infos>
    <errors :errors="(config?.guioptions?.errors !== undefined) ? config.guioptions.errors : []"></errors>
    <div class="row g-4">
      <div class="col">
        <select v-model="karenztyp_kurzbz" :disabled="isinputdisabled('karenztyp_kurzbz')" class="form-select form-select-sm" aria-label=".form-select-sm example">
          <option
            v-for="f in lists.karenztypen"
            :value="f.value"
            :selected="isselected(f.value, this.karenztyp_kurzbz)"
            :disabled="f.disabled">
            {{ f.label }}
          </option>
        </select>
      </div>
      <gueltigkeit ref="gueltigkeit" :config="getgueltigkeit" @markended="markGBsEnded"></gueltigkeit>
      <div class="col-2">
        <span v-if="db_delete" class="badge bg-danger">wird gelöscht</span>
        <button v-if="isremoveable" type="button" class="btn-close btn-sm p-2 float-end" @click="removeVB" aria-label="Close"></button>
        <button v-if="isdeleteable" type="button" class="btn btn-sm p-2 float-end" @click="toggledelete" aria-label="Delete"><i v-if="db_delete" class="fas fa-trash-restore"></i><i v-else="" class="fas fa-trash"></i></button>        
      </div>
    </div>
    <div class="row g-4">
      <div class="col input-group input-group-sm">
        <datepicker v-model="geplanter_geburtstermin" 
          :disabled="isinputdisabled('geplanter_geburtstermin') || karenztyp_kurzbz !== 'elternkarenz'"
          v-bind:enable-time-picker="false"
          v-bind:placeholder="'geplanter Geburtstermin'"
          locale="de"
          format="dd.MM.yyyy"
          model-type="yyyy-MM-dd" 
          class="me-2"></datepicker>      
        <datepicker v-model="tatsaechlicher_geburtstermin" 
          :disabled="isinputdisabled('tatsaechlicher_geburtstermin') || karenztyp_kurzbz !== 'elternkarenz'"
          v-bind:enable-time-picker="false"
          v-bind:placeholder="'tatsaechlicher Geburtstermin'"
          locale="de"
          format="dd.MM.yyyy"
          model-type="yyyy-MM-dd"></datepicker>        
      </div>
      <div class="col">
        &nbsp;
      </div>
    </div>
  </div>
  `,
  components: {
    'gueltigkeit': gueltigkeit,
    'infos': infos,
    'errors': errors,
    'datepicker': VueDatePicker,
  },
  mixins: [
    configurable
  ],
  emits: {
    removeVB: null
  },
  data: function () {
    return {
      id: null,
      karenztyp_kurzbz: '',
      geplanter_geburtstermin: '',
      tatsaechlicher_geburtstermin: '',
      db_delete: false,
      lists: {
        karenztypen: []
      },
      store: store
    };
  },
  created: function() {
    this.getKarenztypen();
    this.setDataFromConfig();
  },
  methods: {
    isselected: function(optvalue, selvalue) {
      return (optvalue === selvalue);
    },
    resetDropdowns: function() {
      if(!this.isinputdisabled('karenztyp')) {
        this.karenztyp = '';
      }
    },
    setDataFromConfig: function() {
      if( this.config?.data?.id !== undefined ) {
        this.id = this.config.data.id;
      }
      if( this.config?.data?.karenztyp_kurzbz !== undefined ) {
        this.karenztyp_kurzbz = this.config.data.karenztyp_kurzbz;
      }
      if( this.config?.data?.geplanter_geburtstermin !== undefined ) {
        this.geplanter_geburtstermin = this.config.data.geplanter_geburtstermin;
      }
      if( this.config?.data?.tatsaechlicher_geburtstermin !== undefined ) {
        this.tatsaechlicher_geburtstermin = this.config.data.tatsaechlicher_geburtstermin;
      }
      if( this.config?.data?.db_delete !== undefined ) {
        this.db_delete = this.config.data.db_delete;
      }
    },
    getKarenztypen: async function() {
      const response = await Vue.$fhcapi.Karenz.getKarenztypen();
      const karenztypen = response.data.retval;
      karenztypen.unshift({
        value: '',
        label: 'Karenztyp wählen',
        disabled: true
      });
      this.lists.karenztypen = karenztypen;
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
          karenztyp_kurzbz: this.karenztyp_kurzbz,
          geplanter_geburtstermin: this.geplanter_geburtstermin,
          tatsaechlicher_geburtstermin: this.tatsaechlicher_geburtstermin,
          db_delete: this.db_delete,          
          gueltigkeit: this.$refs.gueltigkeit.getPayload()
        },
        gbs: []
      };
    }
  }
}
