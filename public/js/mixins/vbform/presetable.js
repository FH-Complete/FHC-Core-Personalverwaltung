import store from '../../components/vbform/vbsharedstate.js';

export default {
  props: [
    'preset'
  ],
  data: function() {
    return {
      children: [],
      store: store
    };
  },
  created: function() {
    this.children = this.getSortedChildrenFromPreset();
  },
  watch: {
    preset: function() {
      this.children = [];
      this.$nextTick(function() {
        this.children = this.getSortedChildrenFromPreset();
      });
    }
  },
  methods: {
    getSortedChildrenFromPreset: function() {
        var tmpchildren = JSON.parse(JSON.stringify(this.preset.children));
        var store = this.store;
        
        if( tmpchildren.length > 0 && typeof tmpchildren[0] === 'string' ) {            
            tmpchildren = tmpchildren.filter(function(child) {
                return (store.getVB(child) !== null);
            });
        }
        
        if( tmpchildren.length < 2 ) {
            return tmpchildren;
        }
        
        const compareVBorGBgueltigvon = function(a, b) {
            const avon = (a?.data?.gueltigkeit?.data?.gueltig_ab !== undefined) 
                       ? a.data.gueltigkeit.data.gueltig_ab 
                       : null;

            const bvon = (b?.data?.gueltigkeit?.data?.gueltig_ab !== undefined) 
                       ? b.data.gueltigkeit.data.gueltig_ab 
                       : null;

            const avd = (avon !== null && avon.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/)) 
                ? (new Date(avon)).getTime() : Infinity;
            const bvd = (bvon !== null && bvon.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/)) 
                ? (new Date(bvon)).getTime() : Infinity;

            return avd - bvd;        
        };
        
        if( (typeof tmpchildren[0] === 'object')
                && tmpchildren[0]?.type === undefined ) {
            console.log('Child Type undefined: ' + JSON.stringify(tmpchildren[0]));
        }
        
        if( (typeof tmpchildren[0] === 'object')
                && tmpchildren[0]?.type !== undefined 
                && (tmpchildren[0].type === 'gehaltsbestandteil') ) {
            tmpchildren.sort((a,b) => {
              return compareVBorGBgueltigvon(a, b);
            });
            tmpchildren.reverse();
        } else if ( typeof tmpchildren[0] === 'string' ) {
            tmpchildren.sort((a,b) => {
                const vba = this.store.getVB(a);
                const vbb = this.store.getVB(b);
                return compareVBorGBgueltigvon(vba, vbb);
            });
            tmpchildren.reverse();
        }
        
        return tmpchildren;
    }  
  }
}
