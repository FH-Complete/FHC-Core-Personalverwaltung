import Kontaktdatenverwaltung from '../../components/verwaltung/Kontaktdatenverwaltung.js';
import FhcAlert from '../../../../../js/plugins/FhcAlert.js';
import Phrasen from '../../../../../js/plugins/Phrasen.js';
import FhcApi from "../../../../../js/plugins/Api.js";
const app = Vue.createApp({
	components: {
		Kontaktdatenverwaltung
	}
});

app
	.use(primevue.config.default, {zIndex: {overlay: 9999}})
	.use(FhcAlert)
	.use(Phrasen)
	.use(FhcApi)
	.mount('#main');