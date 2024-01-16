import presetable from '../../mixins/vbform/presetable.js';
import tab from './tab.js';
import dv from './dv.js';
import store from './vbsharedstate.js';

export default {
  template: `
    <div class="row h-100 overflow-hidden">
      <div class="col-2 h-100">  
        <ul class="nav w-100 position-relative flex-column subsubnav col-2" id="v-menubar" role="menubar" aria-orientation="vertical">
          <li class="nav-item position-relative" v-for="(child, idx) in children" :key="idx">    
              <a
                v-if="child.type === 'tab'"
                class="nav-link"
                :class="(this.activetab === child.guioptions.id) ? 'active' : ''"
                :id="'v-menuitem-' + child.guioptions.id + 'tab'"
                :href="'#v-menuitem-' + child.guioptions.id"
                role="menuitem"
                :aria-controls="'v-menuitem-' + child.guioptions.id"
                :aria-selected="(this.activetab === child.guioptions.id) ? 'true' : 'false'"
                @click="activetab = child.guioptions.id">
                {{ child.guioptions.title }}
                <span
                    v-if="(getErrorsCount(child) > 0)" 
                    class="position-absolute top-50 end-0 translate-middle badge rounded-pill bg-danger">
                  {{ getErrorsCount(child) }}
                </span>
              </a>
          </li>
        </ul>
      </div>
      <div class="col-10 h-100">
        <div class="tab-content w-100 h-100 d-flex flex-column position-relative" id="v-menuitem-tabContent">
          <template v-for="(child, idx) in children">
            <component ref="parts" v-if="child.type === 'tab'" :is="child.type" :key="'tab_' + idx" :preset="child" :activetab="activetab"></component>
            <div v-else="" class="px-3">
              <component ref="parts" :is="child.type" :key="'notab_' + idx" :preset="child"></component>
            </div>
          </template>
        </div>
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
  data: function() {
    return {
      activetab: '',
      errorcounts: {},
      store: store
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
          //this.errorcounts[child.guioptions.id] = Math.floor(Math.random() * 10);
          this.errorcounts[child.guioptions.id] = this.calcErrorCount(child);
        }        
        return this.errorcounts[child.guioptions.id];
    },
    calcErrorCount: function(child) {
        var errorcount = 0;
        if( child?.guioptions?.errors !== undefined ) {
            errorcount += child.guioptions.errors.length;
        }
        if( child.type === 'vertragsbestandteillist' ) {
            for( var childuuid of child.children ) {
                var sibling = this.store.getVB(childuuid);
                if(sibling !== null) {
                    errorcount += this.calcErrorCount(sibling);
                }
            }
        } else if ( child.type.match(/^vertragsbestandteil.*$/) ) {
            if( child?.gbs !== undefined) {
                for( var gb of child.gbs ) {
                    errorcount += this.calcErrorCount(gb);
                }
            }
        } else if ( child?.children !== undefined ) {
            for( var sibling of child.children ) {
                errorcount += this.calcErrorCount(sibling);
            }
        }
        return errorcount;
    }
  }
}
