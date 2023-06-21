import uuid from './uuid.js';
import store from '../../components/vbform/vbsharedstate.js';

export default {
  today: null,
  store: store,
  vbout: {},
  vb2gui: function(vb, mode, child) {
      this.vbout = {
          type: '',
          guioptions: {
              id: uuid.get_uuid(),
              infos: [],
              errors: [],
              deleteable: this.isDeleteable(vb)
          },
          data: {
              
          },
          gbs: []
      };
      switch(vb.vertragsbestandteiltyp_kurzbz) {
          case 'freitext':
              this.freitext2gui(vb, mode);
              break;
          case 'funktion':
              this.funktion2gui(vb, mode);
              break;
          case 'karenz':
              this.karenz2gui(vb, mode);
              break;
          case 'kuendigungsfrist':
              this.kuendigungsfrist2gui(vb, mode);
              break;
          case 'stunden':
              this.stunden2gui(vb, mode);
              break;
          case 'urlaubsanspruch':
              this.urlaubsanspruch2gui(vb, mode);
              break;
          case 'zeitaufzeichnung':
              this.zeitaufzeichnung2gui(vb, mode);
              break;
          default:
              console.log('unknown Vertragsbestandteil ' 
                      + vb.vertragsbestandteiltyp_kurzbz);
              break;
      }
      for( const gb of vb.gehaltsbestandteile ) {
          this.vbout.gbs.push(this.gehaltsbestandteil2gui(gb, mode));
      }
      if( child?.guioptions?.childdefaults?.guioptions?.canhavegehaltsbestandteile !== undefined ) {
        this.vbout.guioptions.canhavegehaltsbestandteile = child.guioptions.childdefaults.guioptions.canhavegehaltsbestandteile;
      }
      return this.vbout;
  },
  getToday: function() {
    if( this.today === null ) {
      this.today = new Date();
      this.today.setHours(23, 59, 59, 999);
    }
    return this.today;
  },
  isFuture: function(bt) {
    var von = new Date(bt.von);
    von.setHours(0, 0, 0, 0);
    if( von > this.getToday() ) {
      return true;
    }
    return false;
  },
  isEndable: function(bt) {    
    if ( this.store.mode === 'aenderung' ) {
      if( bt.von === null || bt.von === ''  ) {
        return false;
      }
/*
      var von = new Date(bt.von);
      von.setHours(0, 0, 0, 0);
      if( von > this.getToday() ) {
        return false;
      }
*/
      return true;
    }
    return false;
  },  
  isDeleteable: function(bt) {    
    if( this.store.mode === 'korrektur' ) {
        return true;
    }
    if ( this.store.mode === 'aenderung' ) {
      if( bt.von === null || bt.von === ''  ) {
        return false;  
      }
      if( this.isFuture(bt) ) {
        return true;
      }
    }
    return false;
  },
  gueltigkeit2gui: function(bt, mode) {
      var disabled = [];
      var endable = (bt.vertragsbestandteiltyp_kurzbz !== 'karenz') 
                  ? this.isEndable(bt) 
                  : false;
      if( endable || (mode === 'aenderung' && !this.isFuture(bt)) ) {
          disabled = [
            'gueltig_ab'
          ];
      }
      var gueltigkeit = {
          guioptions: {
              sharedstatemode: 'ignore',
              disabled: disabled,
              endable: endable
          },
          data: {
              gueltig_ab: bt.von,
              gueltig_bis: bt.bis
          }
      };
      return gueltigkeit;
  },
  freitext2gui: function(vb, mode) {
      this.vbout.type = 'vertragsbestandteilfreitext';
      this.vbout.data = {
          id: vb.vertragsbestandteil_id,
          freitexttyp: vb.freitexttyp_kurzbz,
          titel: vb.titel,
          freitext: vb.freitext,
          gueltigkeit: this.gueltigkeit2gui(vb, mode)
      };
      if( this.isEndable(vb) ) {
        this.vbout.guioptions.disabled = [
            'freitexttyp',
            'titel',
            'freitext'
        ];
      }
      if( ['allin', 'befristung'].indexOf(vb.freitexttyp_kurzbz) > -1 ) {
        this.vbout.guioptions.hidden = [
          'titel',
          'freitext'
        ];
        if( this.vbout.guioptions?.disabled === undefined ) {
          this.vbout.guioptions.disabled = [
            'freitexttyp'
          ];
        } else if ( this.vbout.guioptions.disabled.indexOf('freitexttyp') === -1 ) {
            this.vbout.guioptions.disabled.push('freitexttyp');
        }
      }
  },
  funktion2gui: function(vb, mode) {
      this.vbout.type = 'vertragsbestandteilfunktion';
      this.vbout.data = {
          id: vb.vertragsbestandteil_id,
          funktion: vb.benutzerfunktiondata.funktion_kurzbz,
          orget: vb.benutzerfunktiondata.oe_kurzbz,
          benutzerfunktionid: vb.benutzerfunktion_id,
          mitarbeiter_uid: this.store.mitarbeiter_uid,
          mode: 'bestehende',
          gueltigkeit: this.gueltigkeit2gui(vb, mode)
      };
      if( this.isEndable(vb) ) {
        this.vbout.guioptions.disabled = [
            'funktion',
            'orget',
            'benutzerfunktionid',
            'mode'
        ];
      }
      if( vb.benutzerfunktiondata.funktion_kurzbz.match('zuordnung') ) {
          this.vbout.guioptions.canhavegehaltsbestandteile = false;
      }
  },
  karenz2gui: function(vb, mode) {
      this.vbout.type = 'vertragsbestandteilkarenz';
      this.vbout.data = {
          id: vb.vertragsbestandteil_id,
          karenztyp_kurzbz: vb.karenztyp_kurzbz,
          geplanter_geburtstermin: vb.geplanter_geburtstermin,
          tatsaechlicher_geburtstermin: vb.tatsaechlicher_geburtstermin,
          gueltigkeit: this.gueltigkeit2gui(vb, mode)
      };
      if( this.isEndable(vb) ) {
        this.vbout.guioptions.disabled = [
            'karenztyp_kurzbz'
        ];
      }
  },
  kuendigungsfrist2gui: function(vb, mode) {
      this.vbout.type = 'vertragsbestandteilkuendigungsfrist';
      this.vbout.data = {
          id: vb.vertragsbestandteil_id,
          arbeitgeber_frist: vb.arbeitgeber_frist,
          arbeitnehmer_frist: vb.arbeitnehmer_frist,
          gueltigkeit: this.gueltigkeit2gui(vb, mode)
      };
      if( this.isEndable(vb) ) {
        this.vbout.guioptions.disabled = [
            'arbeitgeber_frist',
            'arbeitnehmer_frist'
        ];
      }
  },
  stunden2gui: function(vb, mode) {
      this.vbout.type = 'vertragsbestandteilstunden';
      this.vbout.data = {
          id: vb.vertragsbestandteil_id,
          stunden: vb.wochenstunden,
          teilzeittyp: vb.teilzeittyp_kurzbz,
          gueltigkeit: this.gueltigkeit2gui(vb, mode)
      };
      if( this.isEndable(vb) ) {
        this.vbout.guioptions.disabled = [
            'stunden',
            'teilzeittyp'
        ];
      }
  },
  urlaubsanspruch2gui: function(vb, mode) {
      this.vbout.type = 'vertragsbestandteilurlaubsanspruch';
      this.vbout.data = {
          id: vb.vertragsbestandteil_id,
          tage: vb.tage,
          gueltigkeit: this.gueltigkeit2gui(vb, mode)
      };
      if( this.isEndable(vb) ) {
        this.vbout.guioptions.disabled = [
            'tage'
        ];
      }
  },
  zeitaufzeichnung2gui: function(vb, mode) {
      this.vbout.type = 'vertragsbestandteilzeitaufzeichnung';
      this.vbout.data = {
          id: vb.vertragsbestandteil_id,
          zeitaufzeichnung: vb.zeitaufzeichnung,
          azgrelevant: vb.azgrelevant,
          homeoffice: vb.homeoffice,
          gueltigkeit: this.gueltigkeit2gui(vb, mode)
      };
      if( this.isEndable(vb) ) {
        this.vbout.guioptions.disabled = [
            'zeitaufzeichnung',
            'azgrelevant',
            'homeoffice'
        ];
      }
  },
  gehaltsbestandteil2gui: function(gb, mode) {
      var disabled = [];
      if( this.isEndable(gb) ) {
          disabled = [
            'gehaltstyp',
            'anmerkung',
            'betrag',
            'valorisierung'
          ];
      }
      var gb = {
          type: 'gehaltsbestandteil',
          guioptions: {
              id: uuid.get_uuid(),
              infos: [],
              errors: [],
              disabled: disabled,              
              deleteable: this.isDeleteable(gb)
          },
          data: {
              id: gb.gehaltsbestandteil_id,
              gehaltstyp: gb.gehaltstyp_kurzbz,
              anmerkung: gb.anmerkung,
              betrag: gb.grundbetrag,
              valorisierung: gb.valorisierung,
              gueltigkeit: this.gueltigkeit2gui(gb, mode)
          }
      };
      return gb;
  }
  
}