import presetable from '../../mixins/vbform/presetable.js';
import tab from './tab.js';
import dv from './dv.js';

export default {
  template: `
  <div class="d-flex align-items-start">
    <div class="nav flex-column nav-pills me-3" id="v-pills-tab" role="tablist" aria-orientation="vertical">
      <template v-for="(child, idx) in children">
        <button
              v-if="child.type === 'tab'"
              :key="idx"
              class="nav-link text-start position-relative pe-5"
              :class="(this.activetab === child.guioptions.id) ? 'active' : ''"
              :id="'v-pills-' + child.guioptions.id + 'tab'"
              data-bs-toggle="pill"
              :data-bs-target="'#v-pills-' + child.guioptions.id"
              type="button"
              role="tab"
              :aria-controls="'v-pills-' + child.guioptions.id"
              :aria-selected="(this.activetab === child.guioptions.id) ? 'true' : 'false'"
              @click="activetab = child.guioptions.id">
          {{ child.guioptions.title }}
          <span
              v-if="(getErrorsCount(child) > 0)" 
              class="position-absolute top-50 end-0 translate-middle badge rounded-pill bg-danger">
            {{ getErrorsCount(child) }}
          </span>
        </button>
      </template>
    </div>

    <div class="tab-content w-100" id="v-pills-tabContent">
      <template v-for="(child, idx) in children">
        <component ref="parts" v-if="child.type === 'tab'" :is="child.type" :key="idx" :preset="child" :activetab="activetab"></component>
        <component ref="parts" v-else="" :is="child.type" :key="idx" :preset="child"></component>
      </template>
    </div>
  </div>
  `,
  components: {
    "dv": dv,
    "tab": tab
  },
  mixins: [
    presetable
  ],
  created: function() {
    if( this.preset?.guioptions?.activetab !== undefined ) {
      this.activetab = this.preset.guioptions.activetab;
    } else if( this.children.length > 0 ) {
      for( const child of this.children ) {
        if( child.type === 'tab' ) {
          this.activetab = child.guioptions.id;
          break;
        }
      }        
    } else {
        this.activetab = '';
        this.errorcounts = {};
    }
  },
  beforeUpdate: function() {
    this.errorscounts = {};  
  },
  data: function() {
    return {
      activetab: '',
      errorcounts: {}
    }
  },
  methods: {
    getPayload: function() {
      var children = [];
      for( var i in this.$refs.parts ) {
        children.push(this.$refs.parts[i].getPayload());
      }
      var guioptions = JSON.parse(JSON.stringify(this.preset.guioptions));
      guioptions.activetab = this.activetab;
      var payload = {
        "type": "tabs",
        "guioptions": guioptions,
        "children": children
      }
      return payload;
    },
    getErrorsCount: function(child) {
        if( typeof this.errorcounts[child.guioptions.id] === 'undefined' ) {
          this.errorcounts[child.guioptions.id] = Math.floor(Math.random() * 10);
        }        
        return this.errorcounts[child.guioptions.id];
    }
  }
}
