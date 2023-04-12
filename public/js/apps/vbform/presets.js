import neuanlage_leer from './presets/neuanlage/leer.js';
import neuanlage_echter_dv from './presets/neuanlage/echter_dv.js';
import neuanlage_freier_dv from './presets/neuanlage/freier_dv.js';
import neuanlage_echter_dv_allin from './presets/neuanlage/echter_dv_allin.js';

import aenderung_leer from './presets/aenderung/leer.js';
import aenderung_echter_dv from './presets/aenderung/echter_dv.js';
import aenderung_echter_dv_allin from './presets/aenderung/echter_dv_allin.js';

export default {
  neuanlage: [
    neuanlage_leer,
    neuanlage_echter_dv,
    neuanlage_echter_dv_allin,
    neuanlage_freier_dv
  ],
  aenderung: [
    aenderung_leer,
    aenderung_echter_dv,
    aenderung_echter_dv_allin
  ]
}
