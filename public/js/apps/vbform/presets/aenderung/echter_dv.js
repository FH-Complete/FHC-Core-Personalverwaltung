import uuid from '../../../../helpers/vbform/uuid.js';

export default {
  type: 'preset',
  guioptions: {
    id: 'echterdv',
    label: 'Echter DV',
    description: 'Standard Vorlage für echte Dienstverträge'
  },
  children: [
    {
      type: 'tabs',
      guioptions: {},
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
                title: 'Befristung',
                vertragsbestandteiltyp: 'vertragsbestandteilfreitext',
                childdefaults: {
                  guioptions: {
                    canhavegehaltsbestandteile: false,
                    disabled: [
                      'freitexttyp'
                    ],
                    hidden: [
                      'titel',
                      'freitext'
                    ]
                  },
                  data: {
                    freitexttyp: "befristung",
                    titel: "Befristung",
                    freitext: "befristeter Dienstvertrag"
                  }
                }
              },
              children: []
            }
          ]
        },
        {
          type: 'tab',
          guioptions: {
            title: 'Arbeitszeit & Basisgehalt',
            id: 'arbeitszeit'
          },
          children: [
            {
              type: 'vertragsbestandteillist',
              guioptions: {
                title: 'Arbeitszeit',
                vertragsbestandteiltyp: 'vertragsbestandteilstunden',
                errors: [],
                infos: []
              },
              children: []
            },
            {
              type: 'vertragsbestandteillist',
              guioptions: {
                title: 'Zeitaufzeichnung',
                vertragsbestandteiltyp: 'vertragsbestandteilzeitaufzeichnung',
                errors: [],
                infos: []
              },
              children: []
            }
          ]
        },
        {
          type: 'tab',
          guioptions: {
            title: 'Funktionen',
            id: 'funktionen'
          },
          children: [
            {
              type: 'vertragsbestandteillist',
              guioptions: {
                title: 'Funktion',
                vertragsbestandteiltyp: 'vertragsbestandteilfunktion',
                errors: [],
                infos: []
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
                vertragsbestandteiltyp: 'vertragsbestandteilfreitext',
                errors: [],
                infos: []
              },
              children: []
            }
          ]
        },
        {
          type: 'tab',
          guioptions: {
            title: 'Sonstiges',
            id: 'sonstiges'
          },
          children: [
            {
              type: 'vertragsbestandteillist',
              guioptions: {
                title: 'Kündigungsfrist',
                vertragsbestandteiltyp: 'vertragsbestandteilkuendigungsfrist',
                errors: [],
                infos: []
              },
              children: []
            }
          ]
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
      dienstverhaeltnisid: 1,
      unternehmen: 'gst',
      vertragsart_kurzbz: 'echterdv',
      gueltigkeit: {
        guioptions: {
          sharedstatemode: "set",
          disabled: [
            'gueltig_bis'
          ]
        }
      }
    }
  },
  vbs: {
  }
}
