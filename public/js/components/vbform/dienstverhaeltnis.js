import gueltigkeit from './gueltigkeit.js';
import configurable from '../../mixins/vbform/configurable.js';
import store from './vbsharedstate.js';

export default {
  template: `
  <div class="col-3">
    <select v-model="store.unternehmen" :disabled="isaenderung && isconfigured('unternehmen')" class="form-select form-select-sm" aria-label=".form-select-sm example">
      <option
        v-for="u in lists.unternehmen"
        :value="u.value"
        :selected="isselected(u.value, this.store.unternehmen)"
        :disabled="u.disabled">
        {{ u.label }}
      </option>
    </select>
  </div>
  <div class="col-3">
    <select v-model="vertragsart_kurzbz" :disabled="isaenderung || isconfigured('vertragsart_kurzbz')" class="form-select form-select-sm" aria-label=".form-select-sm example">
      <option
        v-for="v in lists.vertragsarten"
        :value="v.value"
        :selected="isselected(v.value, this.vertragsart_kurzbz)"
        :disabled="v.disabled">
        {{ v.label}}
      </option>
    </select>
  </div>
  <div class="col-1">&nbsp;</div>
  <gueltigkeit ref="gueltigkeit" :initialsharedstatemode="'set'" :config="getgueltigkeit"></gueltigkeit>
  <div class="col-1">
    <div v-if="this.store.mode === 'korrektur'" class="form-check">
      <input v-model="checkoverlap" class="form-check-input" type="checkbox" id="dvcheckoverlap">
      <label class="form-check-label" for="dvcheckoverlap">
        parallele DVs prüfen
      </label>
    </div>
    <span v-else>&nbsp;</span>
  </div>
  `,
  data: function() {
    return {
      'vertragsart_kurzbz': '',
      'checkoverlap': true,
      'lists': {
          'unternehmen': [],
          'vertragsarten': []
      },
      'store': store
    }
  },
  components: {
    'gueltigkeit': gueltigkeit
  },
  mixins: [
    configurable
  ],
  watch: {
    config: function() {
      this.setDataFromConfig();
    }
  },
  created: function() {
    this.getUnternehmen();
    this.getVertragsarten();
    this.setDataFromConfig();
  },
  methods: {
    isselected: function(optvalue, selvalue) {
      return (optvalue === selvalue);
    },
    getUnternehmen: async function() {
      const response = await Vue.$fhcapi.DV.getUnternehmen();
      const unternehmen = response.data.retval;
      unternehmen.unshift({
        value: '',
        label: 'Unternehmen wählen',
        disabled: true
      });
      this.lists.unternehmen = unternehmen;
    },
    getVertragsarten: async function() {
      const response = await Vue.$fhcapi.DV.getVertragsarten();
      const vertragsarten = response.data.retval;
      vertragsarten.unshift({
        value: '',
        label: 'Vertragsart wählen',
        disabled: true
      });
      return this.lists.vertragsarten = vertragsarten;
    },
    isconfigured: function(field) {
      if( this.config === null ) {
          return false;
      }
      if( typeof this.config[field] !== 'undefined' ) {
        return this.config[field] !== '';
      }
      return false;
    },
    setDataFromConfig: function() {
      if( this.config?.unternehmen !== undefined ) {
        this.store.unternehmen = this.config.unternehmen;
      }
      if( this.config?.vertragsart_kurzbz !== undefined ) {
        this.vertragsart_kurzbz = this.config.vertragsart_kurzbz;
      }
      if( this.config?.checkoverlap !== undefined ) {
        this.checkoverlap = this.config.checkoverlap;
      }
    },
    getPayload: function() {
      return {
        dienstverhaeltnisid: this.config.dienstverhaeltnisid,
        unternehmen: this.store.unternehmen,
        vertragsart_kurzbz: this.vertragsart_kurzbz,
        gueltigkeit: this.$refs.gueltigkeit.getPayload(),
        checkoverlap: this.checkoverlap
      }
    }
  },
  computed: {
    isaenderung: function() {
      var ret = ((this.config?.dienstverhaeltnisid !== undefined)
        && !isNaN(parseInt(this.config.dienstverhaeltnisid))
        && parseInt(this.config.dienstverhaeltnisid) > 0);
      return ret;
    }
  }
}
