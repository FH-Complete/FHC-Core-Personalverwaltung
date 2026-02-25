import uuid from '../../../helpers/vbform/uuid.js';

export default {
  type: 'preset',
  guioptions: {
    id: 'echterdv',
    label: 'Echter DV Allin',
    description: 'Standard Vorlage für echte Dienstverträge',
    infos: [],
    errors:[]
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
                apioptions: {
                  freitexttyp: 'befristung'
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
                apioptions: {
                  freitexttyp: 'allin'
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
                    disabled: [
                      'funktion'
                    ],
                    hidden: []
                  },
                  data: {
                    funktion: "fachzuordnung"
                  }
                }
              },
              children: [
                uuid.get_uuidbyname('oestdkst'),
                uuid.get_uuidbyname('oediszpl'),
                uuid.get_uuidbyname('oefachl')
              ]
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
              children: [
                uuid.get_uuidbyname('fktltg')
              ]
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
          sharedstatemode: "set",
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
        errors: []
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
            ],
            removeable: true
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
        ]
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
            ],
            removeable: true
          },
          data: {
            gehaltstyp: 'zulage_allin',
            valorisierung: true
          }
        }
      ]
    },
    [uuid.get_uuidbyname('aenderung_allin_za')]: {
      "type": "vertragsbestandteilzeitaufzeichnung",
      "guioptions": {
        "id": uuid.get_uuidbyname('aenderung_allin_za'),
        "removeable": false
      },
      "data": {
        "id": null,
        "zeitaufzeichnung": true,
        "azgrelevant": "",
        "homeoffice": true
      }
    },
    [uuid.get_uuidbyname('fktltg')]: {
      type: 'vertragsbestandteilfunktion',
      guioptions: {
        id: uuid.get_uuidbyname('fktltg'),
        removeable: true
      },
      data: {
        funktion: 'Leitung'
      },
      gbs: []
    },
    [uuid.get_uuidbyname('oestdkst')]: {
      type: 'vertragsbestandteilfunktion',
      guioptions: {
        id: uuid.get_uuidbyname('oestdkst'),
        removable: false,
        canhavegehaltsbestandteile: false,
        nobottomborder: true,
        nobottommargin: true,
        disabled: [
          'funktion'
        ]
      },
      data: {
        funktion: 'kstzuordnung'
      }
    },
    [uuid.get_uuidbyname('oediszpl')]: {
      type: 'vertragsbestandteilfunktion',
      guioptions: {
        id: uuid.get_uuidbyname('oediszpl'),
        removable: false,
        canhavegehaltsbestandteile: false,
        nobottomborder: true,
        nobottommargin: true,
        disabled: [
          'funktion'
        ]
      },
      data: {
        funktion: 'oezuordnung'
      }
    },
    [uuid.get_uuidbyname('oefachl')]: {
      type: 'vertragsbestandteilfunktion',
      guioptions: {
        id: uuid.get_uuidbyname('oefachl'),
        removable: false,
        canhavegehaltsbestandteile: false,
        disabled: [
          'funktion'
        ]
      },
      data: {
        funktion: 'fachzuordnung'
      }
    }
  }
}
