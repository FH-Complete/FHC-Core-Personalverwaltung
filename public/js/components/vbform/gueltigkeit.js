import configurable from '../../mixins/vbform/configurable.js';
import sharedstate from './vbsharedstate.js';

export default {
  template: `
  <div class="col-4">
    <div class="input-group input-group-sm">
      <datepicker v-model="gueltig_ab" :disabled="isdisabled || isinputdisabled('gueltig_ab')"
        @update:model-value="gueltigkeitchanged"
        v-bind:enable-time-picker="false"
        v-bind:placeholder="'gültig ab'"
        locale="de"
        format="dd.MM.yyyy"
        model-type="yyyy-MM-dd"></datepicker>
      <span class="input-group-text">&dash;</span>
      <datepicker v-model="gueltig_bis" :disabled="isdisabled || isinputdisabled('gueltig_bis')"
        @update:model-value="gueltigkeitchanged"
        v-bind:enable-time-picker="false"
        v-bind:placeholder="'gültig bis'"
        locale="de"
        format="dd.MM.yyyy"
        model-type="yyyy-MM-dd"></datepicker>
      <span class="input-group-text" v-if="(this.sharedstatemode === 'reflect')">
        <i @click="changesharedstatemode('custom')" class="fas fa-link"></i>
      </span>
      <span class="input-group-text" v-else-if="(this.sharedstatemode === 'custom')">
        <i @click="changesharedstatemode('reflect')" class="fas fa-unlink"></i>
      </span>
      <span class="input-group-text bg-white border-0" v-else>
        <i class="fas fa-square text-white"></i>
      </span>
    </div>
  </div>
  `,
  props: {
    'initialsharedstatemode': {
      type: String,
      default: 'reflect',
      validator: function(value) {
        return ['reflect', 'set', 'custom', 'ignore'].includes(value);
      }
    }
  },
  data: function() {
    return {
      sharedstate: sharedstate,
      sharedstatemode: '',
      gueltig_ab: '',
      gueltig_bis: ''
    }
  },
  components: {
    "datepicker": VueDatePicker
  },
  mixins: [
    configurable
  ],
  created: function() {
    this.sharedstatemode = this.initialsharedstatemode;
    this.setDataFromSharedSate();
    this.setGUIOptionsFromConfig();
    this.setDataFromConfig();
  },
  watch: {
    'sharedstate.gueltigkeit.gueltig_ab': function() {
      if( this.sharedstatemode === 'reflect' ) {
        this.gueltig_ab = this.sharedstate.gueltigkeit.gueltig_ab;
      }
    },
    'sharedstate.gueltigkeit.gueltig_bis': function() {
      if( this.sharedstatemode === 'reflect' ) {
        this.gueltig_bis = this.sharedstate.gueltigkeit.gueltig_bis;
      }
    },
  },
  methods: {
    setDataFromConfig: function() {
      if( this?.config?.data?.gueltig_ab !== undefined ) {
        this.gueltig_ab = this.config.data.gueltig_ab;
      }
      if( this?.config?.data?.gueltig_bis !== undefined ) {
        this.gueltig_bis = this.config.data.gueltig_bis;
      }
    },
    setDataFromSharedSate: function() {
      if( this.sharedstatemode === 'reflect' ) {
        this.gueltig_ab = this.sharedstate.gueltigkeit.gueltig_ab;
        this.gueltig_bis = this.sharedstate.gueltigkeit.gueltig_bis;
      }
    },
    setGUIOptionsFromConfig: function() {
      if( this?.config?.guioptions?.sharedstatemode !== undefined ) {
        this.sharedstatemode = this.config.guioptions.sharedstatemode;
      }
    },
    getPayload: function() {
      var guioptions = (this?.config?.guioptions !== undefined)
                     ? JSON.parse(JSON.stringify(this.config.guioptions))
                     : {};
      guioptions.sharedstatemode = this.sharedstatemode;
      return {
        guioptions: guioptions,
        data: {
          gueltig_ab: this.gueltig_ab,
          gueltig_bis: this.gueltig_bis
        }
      };
    },
    gueltigkeitchanged: function() {
      if( this.sharedstatemode === 'set' ) {
        this.sharedstate.gueltigkeit.gueltig_ab = this.gueltig_ab;
        this.sharedstate.gueltigkeit.gueltig_bis = this.gueltig_bis;
      }
    },
    changesharedstatemode: function(mode) {
      this.sharedstatemode = mode;
      this.setDataFromSharedSate();
    }
  },
  computed: {
    isdisabled: function() {
      return (this.sharedstatemode === 'reflect');
    }
  }
}