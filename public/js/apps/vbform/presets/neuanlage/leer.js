import uuid from '../../../../helpers/vbform/uuid.js';

export default {
  type: 'preset',
  guioptions: {
    id: 'leer',
    label: 'Leere Vorlage',
    description: 'Leere Vorlage. Alles muss manuell definiert werden.'
  },
  children: [
    {
      type: 'dv',
	    guioptions: {
      },
      children: []
    },
    {
      type: 'vblistgroup',
      guioptions: {
      },
      children: [
        {
          type: 'vertragsbestandteillist',
          guioptions: {
            title: 'Arbeitszeit',
            vertragsbestandteiltyp: 'vertragsbestandteilstunden'
          },
          children: []
        },
        {
          type: 'vertragsbestandteillist',
          guioptions: {
            title: 'Zeitaufzeichnung',
            vertragsbestandteiltyp: 'vertragsbestandteilzeitaufzeichnung'
          },
          children: []
        },
        {
          type: 'vertragsbestandteillist',
          guioptions: {
            title: 'Kündigungsfrist',
            vertragsbestandteiltyp: 'vertragsbestandteilkuendigungsfrist'
          },
          children: []
        },
        {
          type: 'vertragsbestandteillist',
          guioptions: {
            title: 'Urlaubsanspruch',
            vertragsbestandteiltyp: 'vertragsbestandteilurlaubsanspruch'
          },
          children: []
        },
        {
          type: 'vertragsbestandteillist',
          guioptions: {
            title: 'Funktionen',
            vertragsbestandteiltyp: 'vertragsbestandteilfunktion'
          },
          children: []
        },
        {
          type: 'vertragsbestandteillist',
          guioptions: {
            title: 'Sonstiges',
            vertragsbestandteiltyp: 'vertragsbestandteilfreitext'
          },
          children: []
        }
      ]
    }
  ],
  dv: {
    type: 'dienstverhaeltnis',
    guioptions: {
        infos: [],
        errors: []
    },
    data: {
      dienstverhaeltnisid: null,
      unternehmen: '',
      vertragsart_kurzbz: '',
      gueltigkeit: {
        guioptions: {
          sharedstatemode: "set",
          disabled: []
        }
      }          
    }
  },
  vbs: {}
}
