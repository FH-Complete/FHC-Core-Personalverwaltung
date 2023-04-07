import gueltigkeit from './gueltigkeit.js';
import configurable from '../../mixins/vbform/configurable.js';

export default {
  template: `
  <div class="col-3">
    <select v-model="unternehmen" :disabled="isaenderung || isconfigured('unternehmen')" class="form-select form-select-sm" aria-label=".form-select-sm example">
      <option
        v-for="u in getUnternehmen()"
        :value="u.value"
        :selected="isselected(u.value, this.unternehmen)"
        :disabled="u.disabled">
        {{ u.label }}
      </option>
    </select>
  </div>
  <div class="col-3">
    <select v-model="vertragsart_kurzbz" :disabled="isaenderung || isconfigured('vertragsart_kurzbz')" class="form-select form-select-sm" aria-label=".form-select-sm example">
      <option
        v-for="v in getVertragsarten()"
        :value="v.value"
        :selected="isselected(v.value, this.vertragsart_kurzbz)"
        :disabled="v.disabled">
        {{ v.label}}
      </option>
    </select>
  </div>
  <div class="col-1">&nbsp;</div>
  <gueltigkeit ref="gueltigkeit" :initialsharedstatemode="'set'" :config="getgueltigkeit"></gueltigkeit>
  <div class="col-1">&nbsp;</div>
  `,
  data: function() {
    return {
      'unternehmen': '',
      'vertragsart_kurzbz': ''
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
    this.setDataFromConfig();
  },
  methods: {
    isselected: function(optvalue, selvalue) {
      return (optvalue === selvalue);
    },
    getUnternehmen: function() {
      return [
        {
          value: '',
          label: 'Unternehmen wählen',
          disabled: true
        },
        {
          value: 'fhtw',
          label: 'FH Technikum Wien',
          disabled: false
        },
        {
          value: 'twacademy',
          label: 'Technikum Wien GmbH',
          disabled: false
        }
      ];
    },
    getVertragsarten: function() {
      return [
        {
          value: '',
          label: 'Vertragsart wählen',
          disabled: true
        },
        {
          value: 'echterdv',
          label: 'Echter DV',
          disabled: false
        },
        {
          value: 'freierdv',
          label: 'Freier DV',
          disabled: false
        },
        {
          value: 'gastlektor',
          label: 'Gastlektor',
          disabled: false
        },
        {
          value: 'studhilfskraft',
          label: 'Studentische Hilfskraft',
          disabled: false
        },
        {
          value: 'werkvertrag',
          label: 'Werkvertrag',
          disabled: false
        }
      ];
    },
    isconfigured: function(field) {
      if( typeof this.config[field] !== 'undefined' ) {
        return this.config[field] !== '';
      }
      return false;
    },
    setDataFromConfig: function() {
      if( this.config?.unternehmen !== undefined ) {
        this.unternehmen = this.config.unternehmen;
      }
      if( this.config?.vertragsart_kurzbz !== undefined ) {
        this.vertragsart_kurzbz = this.config.vertragsart_kurzbz;
      }
    },
    getPayload: function() {
      return {
        dienstverhaeltnisid: this.config.dienstverhaeltnisid,
        unternehmen: this.unternehmen,
        vertragsart_kurzbz: this.vertragsart_kurzbz,
        gueltigkeit: this.$refs.gueltigkeit.getPayload()
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
