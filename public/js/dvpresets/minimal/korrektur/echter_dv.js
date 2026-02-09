import uuid from '../../../helpers/vbform/uuid.js';

export default {
  type: 'preset',
  guioptions: {
    id: 'echterdv',
    label: 'Echter DV',
    description: 'Standard Vorlage für echte Dienstverträge',
    for_vertragsart_kurzbz: [
        'echterdv', 'studentischehilfskr'
    ],
    default_for_vertragsart_kurzbz: [
        'echterdv', 'studentischehilfskr'
    ]
  },
  children: [
    {
      type: 'tabsspacer',
      guioptions: {},
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
                filter: {
                  freitexttyp: [
                    "befristung"
                  ]
                },
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
                title: 'Karenz',
                vertragsbestandteiltyp: 'vertragsbestandteilkarenz'
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
            },
            {
              type: 'vertragsbestandteillist',
              guioptions: {
                title: 'All-In',
                vertragsbestandteiltyp: 'vertragsbestandteilfreitext',
                filter: {
                  freitexttyp: [
                    'allin'
                  ]
                },
                childdefaults: {
                  guioptions: {
                    canhavegehaltsbestandteile: true,
                    disabled: [
                      'freitexttyp'
                    ],
                    hidden: [
                      'titel',
                      'freitext'
                    ]
                  },
                  data: {
                    freitexttyp: "allin",
                    titel: "All-In",
                    freitext: "All-In Vertrag"
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
            title: 'Funktionen',
            id: 'funktionen'
          },
          children: [
            {
              type: 'vertragsbestandteillist',
              guioptions: {
                title: 'Zuordnung',
                vertragsbestandteiltyp: 'vertragsbestandteilfunktion',
                filter: 'zuordnung',
                errors: [],
                infos: [],
                childdefaults: {
                  guioptions: {
                    canhavegehaltsbestandteile: false,
                    disabled: [],
                    hidden: []
                  },
                  data: {}
                }
              },
              children: []
            },
            {
              type: 'vertragsbestandteillist',
              guioptions: {
                title: 'Funktion',
                vertragsbestandteiltyp: 'vertragsbestandteilfunktion',
                filter: 'funktion',
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
                filter: {
                  freitexttyp: [
                    "zusatzvereinbarung", 
                    "sonstiges"
                  ]
                },
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
      dienstverhaeltnisid: null,
      unternehmen: '',
      vertragsart_kurzbz: 'echterdv',
      gueltigkeit: {
        guioptions: {
          sharedstatemode: "ignore",
          disabled: []
        }
      }
    }
  },
  vbs: {
  }
}
