import { Modal } from '../Modal.js';
import { ModalDialog } from '../ModalDialog.js';
import { Toast } from '../Toast.js';
import { usePhrasen } from '../../../../../../public/js/mixins/Phrasen.js';
import ApiStundensatz from '../../api/factory/stundensatz.js';

export const HourlyRateData = {
	name: 'HourlyRateData',
	components: {
		Modal,
		ModalDialog,
		Toast,
		"datepicker": VueDatePicker,

	},
	props: {
		modelValue: { type: Object, default: () => ({}), required: false},
        config: { type: Object, default: () => ({}), required: false},
		writePermission: { type: Boolean, required: false },
	},
	setup (props) {

        const $api = Vue.inject('$api');
		const $fhcAlert = Vue.inject('$fhcAlert');
		const { t } = usePhrasen();

		const theModel = Vue.computed({ 
            get: () => props.modelValue,
            set: (value) => emit('update:modelValue', value),
        });

		const readonly = Vue.ref(false);
		const isFetching = Vue.ref(false);

		const hourlyRatedataList = Vue.ref([]);
		const dialogRef = Vue.ref();

		const types = Vue.inject('hourlyratetypes');
		const unternehmen = Vue.inject('unternehmen');

		const fetchData = async () => {
			if (theModel.value.personUID==null)
			{
				hourlyRatedataList.value = [];
				return;
			}
			isFetching.value = true

			try
			{
				const response = await $api.call(ApiStundensatz.getStundensaetze(theModel.value.personUID));
				hourlyRatedataList.value = response.data;
			}
			catch (error)
			{
				$fhcAlert.handleSystemError(error)
			}
			finally
			{
				isFetching.value = false;
			}
		}

		const createShape = () => {
			return {
				stundensatz_id: 0,
				uid: theModel.value.personUID,
				stundensatztyp: "",
				stundensatz: "",
				oe_kurzbz: "",
				gueltig_von: "",
				gueltig_bis: "",
			}
		}

		const currentValue = Vue.ref(createShape());
		const preservedValue = Vue.ref(createShape());

		Vue.watch(theModel, (currentVal, oldVal) => {
			fetchData();
		});

		Vue.onMounted(() => {
			currentValue.value = createShape();
			fetchData();
		})

		const houryratedataListArray = Vue.computed(() => (hourlyRatedataList.value ? Object.values(hourlyRatedataList.value) : []));

		// Modal
		const modalRef = Vue.ref();
		const confirmDeleteRef = Vue.ref();

		const showAddModal = () => {
			currentValue.value = createShape();
			// reset form state
			frmState.beginnBlurred=false;
			frmState.bisBlurred=false;
			frmState.typBlurred=false;
			frmState.satzBlurred=false;
			frmState.unternehmenBlurred=false;
			// call bootstrap show function
			modalRef.value.show();
		}

		const hideModal = () => {
			modalRef.value.hide();
		}

		const showEditModal = (id) => {
			currentValue.value = { ...hourlyRatedataList.value[id] };
			modalRef.value.show();
		}

		const showDeleteModal = async (id) => {
			currentValue.value = { ...hourlyRatedataList.value[id] };

			if (await $fhcAlert.confirm({
                    message: t('person','stundensatzWirklichLoeschen') + ' ' + currentValue.value?.stundensatztyp + ' ' + t('person','wirklichLoeschen'),
                    acceptLabel: 'Löschen',
				    acceptClass: 'p-button-danger'
                }) === false) {
                return;
            }    

			try {
				const res = await $api.call(ApiStundensatz.deleteStundensatz(id));

				if (res.meta.status === "success")
				{
					delete hourlyRatedataList.value[id];
					showDeletedToast();
				}
			} catch (error) {
				$fhcAlert.handleSystemError(error)
			} finally {
				isFetching.value = false
			}
		}

		const okHandler = async () => {
			if (validate())
			{
				try {
					const r = await $api.call(ApiStundensatz.updateStundensatz(currentValue.value));
					if (r.meta.status === "success")
					{
						hourlyRatedataList.value[r.data[0].stundensatz_id] = r.data[0];
						preservedValue.value = currentValue.value;
						showToast();
					}
				}
				catch (error)
				{
					$fhcAlert.handleSystemError(error)
				}
				finally
				{
					isFetching.value = false
				}

				hideModal();
			}
			else
			{
				console.log("form invalid");
			}
		}

		// -------------
		// form handling
		// -------------

		const houryrateDataFrm = Vue.ref();

		const frmState = Vue.reactive({ beginnBlurred: false, typBlurred: false, bisBlurred: false, satzBlurred: false, unternehmenBlurred: false,  wasValidated: false });

		const validBeginn = (n) => {
			return !!n && n.trim() != "";
		}

		const validInput = (input) => {
			if (input === undefined || input === '')
				return false;
			else
				return true;
		}

		const checkDates = (beginn, ende) => {

			if (beginn !== '' && ende !== '' && ende !== null && beginn !== null)
			{
				beginn = new Date(beginn);
				ende = new Date(ende);

				if (ende >= beginn)
				{
					frmState.bisBlurred = false;
					return true;
				}
				else
				{
					frmState.bisBlurred = true;
					return false;
				}
			}
			else
			{
				frmState.bisBlurred = false;
				return true;
			}

		}


		const validate = () => {
			frmState.beginnBlurred = true;
			frmState.typBlurred = true;
			frmState.satzBlurred = true;
			frmState.unternehmenBlurred = true;
			if (validBeginn(currentValue.value.gueltig_von) &&
				validInput(currentValue.value.stundensatz) &&
				validInput(currentValue.value.stundensatztyp) &&
				validInput(currentValue.value.oe_kurzbz) &&
				checkDates(currentValue.value.gueltig_von, currentValue.value.gueltig_bis)
			) {
				return true;
			}
			return false;
		}

		const formatDate = (d) => {
			if (d != null && d != '') {
				return d.substring(8, 10) + "." + d.substring(5, 7) + "." + d.substring(0, 4);
			} else {
				return ''
			}
		}

		// Toast
		const toastRef = Vue.ref();
		const deleteToastRef = Vue.ref();

		const showToast = () => {
            $fhcAlert.alertSuccess(t('person','stundensatzGespeichert'));
        }

        const showDeletedToast = () => {
            $fhcAlert.alertSuccess(t('person','stundensatzGeloescht'));
        }

		return {
			hourlyRatedataList,
			houryratedataListArray,
			currentValue,
			readonly,
			frmState,
			dialogRef,
			toastRef,
			deleteToastRef,
			houryrateDataFrm,
			modalRef,
			types,
			unternehmen,

			validBeginn, validInput, checkDates, formatDate,
			showToast, showDeletedToast,
			showAddModal, hideModal, okHandler,
			showDeleteModal, showEditModal, confirmDeleteRef, t,
		}
	},
	template: `
	<div class="row">
	</div>
	<div class="row pt-md-4">
		 <div class="col">
			 <div class="card">
				<div class="card-header">
					<div class="h5"><h5>{{ t('person','stundensaetze') }}</h5></div>        
				</div>

				<div class="card-body">
					<div class="d-grid d-md-flex justify-content-start py-2">
						<button type="button" class="btn btn-sm btn-primary" @click="showAddModal()">
						<i class="fa fa-plus"></i> {{ t('ui','stundensatz') }}
						</button>
					</div>
					<div class="table-responsive">
						<table class="table table-hover table-sm">
							<thead>                
							<tr>
								<th scope="col">{{ t('global','typ') }}</th>
								<th scope="col">{{ t('ui','from') }}</th>
								<th scope="col">{{ t('global','bis') }}</th>
								<th scope="col">{{ t('core','unternehmen') }}</th>
								<th scope="col">{{ t('ui','stundensatz') }}</th>
								<th scope="col"></th>
							</tr>
							</thead>
							<tbody>
							<tr v-for="hourlyratedata in houryratedataListArray" :key="hourlyratedata.stundensatz_id">
								<td class="align-middle">{{ hourlyratedata.stundensatztyp }}</td>
								<td class="align-middle">{{ formatDate(hourlyratedata.gueltig_von) }}</td>
								<td class="align-middle">{{ formatDate(hourlyratedata.gueltig_bis) }}</td>
								<td class="align-middle">{{ hourlyratedata.oe_kurzbz }}</td>
								<td class="align-middle">{{ hourlyratedata.stundensatz }}</td>
								<td class="align-middle" width="5%">
									<div class="d-grid gap-2 d-md-flex align-middle">
										<button type="button" class="btn btn-outline-secondary btn-sm" @click="showEditModal(hourlyratedata.stundensatz_id)">
											<i class="fa fa-pen"></i>
										</button>
										<button type="button" class="btn btn-outline-secondary btn-sm" @click="showDeleteModal(hourlyratedata.stundensatz_id)">
											<i class="fa fa-xmark"></i>
										</button>
									</div>
								</td>
							</tr>
							</tbody>
						</table>            
					</div>
				</div>
			 </div>
		 </div>
	</div>

	<!-- detail modal -->
	<Modal :title="t('ui','stundensatz')" ref="modalRef" class="stundensatzModal">
		<template #body>
			<form class="row g-3" ref="houryrateDataFrm">
							
				<div class="col-md-4">
					<label for="stundensatztyp" class="required form-label">{{ t('global','typ') }}</label><br>
					<select v-if="!readonly" id="stundensatztyp" @blur="frmState.typBlurred = true"  :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validInput(currentValue.stundensatztyp) && frmState.typBlurred}" v-model="currentValue.stundensatztyp" class="form-select form-select-sm" aria-label=".form-select-sm " >
						<option v-for="(item, index) in types" :value="item.stundensatztyp">
							{{ item.bezeichnung }}
						</option>                       
					</select>
					<input v-else type="text" readonly class="form-control-sm form-control-plaintext" id="stundensatztyp" :value="currentValue.stundensatztyp">
				</div>
				<div class="col-md-3">
					<label for="beginn" class="required form-label">{{ t('ui','from') }}</label>
					<datepicker id="beginn"
						@blur="frmState.beginnBlurred = true"
						v-bind:enable-time-picker="false"
						:input-class-name="(!validBeginn(currentValue.gueltig_von) && frmState.beginnBlurred) ? 'dp-invalid-input' : ''"						
						v-model="currentValue.gueltig_von"
						text-input 
						locale="de"
						format="dd.MM.yyyy"
						auto-apply 
						model-type="yyyy-MM-dd"
					></datepicker>
				</div>
				<div class="col-md-3">
					<label for="ende" class="form-label">{{ t('global','bis') }}</label>
					<datepicker id="ende"
						@blur="frmState.bisBlurred = true"
						v-bind:enable-time-picker="false"
						v-model="currentValue.gueltig_bis"
						text-input 
						locale="de"
						format="dd.MM.yyyy"
						auto-apply 
						model-type="yyyy-MM-dd"
					></datepicker>
				</div>
				<div class="col-md-2">
				</div>
				<!-- -->
			   <div class="col-md-4">
					<label for="stundensatz" class="required form-label">{{ t('ui','stundensatz') }}</label>
					<input type="number" :readonly="readonly" @blur="frmState.satzBlurred = true" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validInput(currentValue.stundensatz) && frmState.satzBlurred}" id="stundensatz" v-model="currentValue.stundensatz">
				</div>
			  
			   <div class="col-md-4">
					<label for="unternehmen" class="required form-label">{{ t('core','unternehmen') }}</label><br>
					<select v-if="!readonly" id="unternehmen" @blur="frmState.unternehmenBlurred = true"  :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validInput(currentValue.oe_kurzbz) && frmState.unternehmenBlurred}" v-model="currentValue.oe_kurzbz" class="form-select form-select-sm" aria-label=".form-select-sm " >
						<option v-for="(item, index) in unternehmen" :value="item.value">
							{{ item.label }}
						</option>                       
					</select>
					<input v-else type="text" readonly class="form-control-sm form-control-plaintext" id="unternehmen" :value="currentValue.oe_kurzbz">
				</div>
			   
				
				<!-- changes -->
				<div class="col-8">
					<div class="modificationdate">{{ currentValue.insertamum }}/{{ currentValue.insertvon }}, {{ currentValue.updateamum }}/{{ currentValue.updatevon }}</div>
				</div>
				
			</form>
		</template>
		<template #footer>
			<button type="button" class="btn btn-primary" @click="okHandler()" >
				{{ t('ui','speichern') }}
			</button>
		</template>

	</Modal>

	<ModalDialog :title="t('global','warnung')" ref="dialogRef">
	  <template #body>
	  	{{ t('person','stundensatzNochNichtGespeichert') }}
	  </template>
	</ModalDialog>

	`
}

export default HourlyRateData;