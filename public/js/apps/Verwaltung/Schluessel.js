import Schluesselverwaltung from '../../components/verwaltung/Schluesselverwaltung.js';
import FhcAlert from '../../../../../js/plugins/FhcAlert.js';
import Phrasen from '../../../../../js/plugins/Phrasen.js';
import FhcApi from "../../../../../js/plugins/Api.js";
const app = Vue.createApp({
	components: {
		Schluesselverwaltung
	}
});

app
	.use(primevue.config.default, {zIndex: {overlay: 9999}})
	.use(FhcAlert)
	.use(Phrasen)
	.use(FhcApi)
	.mount('#main');