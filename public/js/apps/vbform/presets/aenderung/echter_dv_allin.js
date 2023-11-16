import uuid from '../../../../helpers/vbform/uuid.js';

export default {
  type: 'preset',
  guioptions: {
    id: 'echterdv2allin',
    label: 'Echten DV auf Allin umstellen',
    description: 'Änderungs-Vorlage um echten Dienstvertrag auf Allin umzustellen.',
    for_vertragsart_kurzbz: [
        'echterdv'
    ]
  },
  children: [
    {
      type: 'dv',
      guioptions: {
      },
      children: []
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
                    'befristung'
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
              children: [
                uuid.get_uuidbyname('aenderung_allin_std')
              ]
            },
            {
              type: 'vertragsbestandteillist',
              guioptions: {
                title: 'Zeitaufzeichnung',
                vertragsbestandteiltyp: 'vertragsbestandteilzeitaufzeichnung',
                errors: [],
                infos: []
              },
              children: [
                uuid.get_uuidbyname('aenderung_allin_za')
              ]
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
              children: [
                uuid.get_uuidbyname('aenderung_allin_freitext')
              ]
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
                    ],
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
          disabled: [
            'gueltig_bis'
          ]
        }
      }
    }
  },
  vbs: {
    [uuid.get_uuidbyname('aenderung_allin_std')]: {
      type: 'vertragsbestandteilstunden',
      guioptions: {
        id: uuid.get_uuidbyname('aenderung_allin_std'),
        infos: [],
        errors: [],
        removeable: true
      },
      data: {
        id: null,
        stunden: ''
      },
      gbs: [
        {
          type: 'gehaltsbestandteil',
          guioptions: {
            id: uuid.get_uuid(),
            infos: [],
            errors: [],
            disabled: [
              'gehaltstyp'
            ]
          },
          data: {
            gehaltstyp: 'grundgehalt',
            valorisierung: true
          }
        }
      ]
    },
    [uuid.get_uuidbyname('aenderung_allin_freitext')]: {
      type: 'vertragsbestandteilfreitext',
      guioptions: {
        id: uuid.get_uuidbyname('aenderung_allin_freitext'),
        infos: [],
        errors: [],
        disabled: [
          'freitexttyp'
        ],
        hidden: [
          'titel',
          'freitext'
        ],
        removeable: true
      },
      data: {
        id: null,
        freitexttyp: 'allin',
        titel: 'All-In',
        freitext: 'All-In Vertrag'
      },
      gbs: [
        {
          type: 'gehaltsbestandteil',
          guioptions: {
            id: uuid.get_uuid(),
            infos: [],
            errors: [],
            removeable: false,
            disabled: [
              'gehaltstyp'
            ]
          },
          data: {
            gehaltstyp: 'zulage',
            valorisierung: true
          }
        }
      ]
    },
    [uuid.get_uuidbyname('aenderung_allin_za')]: {
      "type": "vertragsbestandteilzeitaufzeichnung",
      "guioptions": {
        "id": uuid.get_uuidbyname('aenderung_allin_za'),
        "removeable": true
      },
      "data": {
        "id": null,
        "zeitaufzeichnung": true,
        "azgrelevant": "",
        "homeoffice": true
      }
    }
  }
}
