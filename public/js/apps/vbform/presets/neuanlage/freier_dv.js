import uuid from '../../../../helpers/vbform/uuid.js';

export default {
  type: 'preset',
  guioptions: {
    id: 'freierdv',
    label: 'Freier DV',
    description: 'freier Dienstvertrag'
  },
  children: [
    {
      type: 'tabs',
      guioptions: {

      },
      children: [
        {
          type: 'tab',
          guioptions: {
            title: 'Allgemein',
            id: 'allgemein'
          },
          children: [
            {
              type: 'dv',
              guioptions: {
              },
              children: []
            }
          ]
        },
        {
          type: 'tab',
          guioptions: {
            title: 'Zusatzvereinbarungen',
            id: 'zusatzvereinbarungen'
          },
          children: [
            {
              type: 'vertragsbestandteillist',
              guioptions: {
                title: 'Zusatzvereinbarungen',
                vertragsbestandteiltyp: 'vertragsbestandteilfreitext'
              },
              children: []
            }
          ]
        }
      ]
    }
  ],
  data: {
    dienstverhaeltnisid: null,
    unternehmen: '',
    vertragsart_kurzbz: 'freierdv',
    gueltigkeit: {
      guioptions: {
        sharedstatemode: "set",
        disabled: []
      }
    }
  },
  vbs: {
  }
}
