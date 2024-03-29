export default {
  props: [
    'config'
  ],
  methods: {
    isinputdisabled: function(inputname) {
      if( this.config?.guioptions?.disabled === undefined ) {
        return false;
      }
      return this.config.guioptions.disabled.includes(inputname);
    },
    showinput: function(inputname) {
      if( this.config?.guioptions?.hidden === undefined ) {
        return true;
      }
      return !this.config.guioptions.hidden.includes(inputname);
    },
    markGBsEnded: function() {
        if( this.$refs?.gbh !== undefined ) {
          this.$refs.gbh.markGBsEnded();
        }
    },
    toggledelete: function() {
        this.db_delete = !this.db_delete;
        if( this.$refs?.gbh !== undefined ) {
          this.$refs.gbh.setGBsDelete(this.db_delete);
        }
    },
    setDelete: function(hastobedeleted) {
        this.db_delete = hastobedeleted;
    }
  },
  computed: {
    isendable: function() {
      return (this.config?.guioptions?.endable === undefined)
        ? false : this.config.guioptions.endable;
    },      
    isdeleteable: function() {
      return (this.config?.guioptions?.deleteable === undefined)
        ? false : this.config.guioptions.deleteable;
    },
    isremoveable: function() {
      return (this.config?.guioptions?.removeable === undefined)
        ? false : this.config.guioptions.removeable;
    },
    canhavegehaltsbestandteile: function() {
      return (this.config?.guioptions?.canhavegehaltsbestandteile === undefined)
        ? true : this.config.guioptions.canhavegehaltsbestandteile;
    },
    getgehaltsbestandteile: function() {
      var gbs = (this.config?.gbs !== undefined) ? this.config.gbs : [];
      return { children: gbs };
    },
    getgueltigkeit: function() {
      if( this.config?.gueltigkeit !== undefined ) {
        return this.config.gueltigkeit;
      } else if ( this.config?.data?.gueltigkeit !== undefined ) {
        return this.config.data.gueltigkeit;
      } else {
        return {};
      }
    },
    vbcssclasses: function() {
      var classes = [];
      if( (this.config?.guioptions?.nobottomborder === undefined)
        || ((this.config?.guioptions?.nobottomborder !== undefined)
              && this.config.guioptions.nobottomborder === false) ) {
        classes.push('border-bottom');
      }
      if( (this.config?.guioptions?.nobottommargin === undefined)
        || ((this.config?.guioptions?.nobottommargin !== undefined)
              && this.config.guioptions.nobottommargin === false) ) {
        classes.push('mb-3');
      }
      return classes;
    }
  }
}
