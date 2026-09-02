import { Modal } from '../Modal.js';
import { ModalDialog } from '../ModalDialog.js';
import { Toast } from '../Toast.js';
import { usePhrasen } from '../../../../../js/mixins/Phrasen.js';
import ApiStundengrenze from '../../api/factory/stundengrenze.js';

export const HourLimitData = {
	name: 'HourLimitData',
	components: {
		Modal,
		ModalDialog,
		Toast

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

		const hourLimitdataList = Vue.ref([]);
		const semesterList = Vue.ref([]);
		const oeList = Vue.ref([]);
		const dialogRef = Vue.ref();

		const fetchData = async () => {
			if (theModel.value.personUID==null)
			{
				hourLimitdataList.value = [];
				return;
			}
			isFetching.value = true

			try
			{
				const response = await $api.call(ApiStundengrenze.getStundengrenzen(theModel.value.personUID));
				hourLimitdataList.value = response.data;
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

		const fetchStudiensemester = async () => {
			isFetching.value = true

			try
			{
				const response = await $api.call(ApiStundengrenze.getStudiensemester());
				semesterList.value = response.data;
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

		const fetchOrgets = async () => {
			isFetching.value = true

			try
			{
				const response = await $api.call(ApiStundengrenze.getOrgets());
				oeList.value = response.data;
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
				stundengrenze_id: 0,
				mitarbeiter_uid: theModel.value.personUID,
				studiensemester_kurzbz: "",
				oe_kurzbz: null,
				stundengrenze: 0
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

		const hourlimitdataListArray = Vue.computed(() => (hourLimitdataList.value ? Object.values(hourLimitdataList.value) : []));

		// Modal
		const modalRef = Vue.ref();
		const confirmDeleteRef = Vue.ref();

		const showAddModal = () => {
			currentValue.value = createShape();
			// reset form state
			frmState.semesterBlurred=false;
			frmState.grenzeBlurred=false;
			frmState.oeBlurred=false;
			// call bootstrap show function
			modalRef.value.show();
		}

		const hideModal = () => {
			modalRef.value.hide();
		}

		const showEditModal = (id) => {
			currentValue.value = { ...hourLimitdataList.value[id] };
			modalRef.value.show();
		}

		const showDeleteModal = async (id) => {
			currentValue.value = { ...hourLimitdataList.value[id] };

			if (await $fhcAlert.confirm({
                    message: t('person','stundengrenzeWirklichLoeschen'),
                    acceptLabel: 'Löschen',
				    acceptClass: 'p-button-danger'
                }) === false) {
                return;
            }    

			try {
				const res = await $api.call(ApiStundengrenze.deleteStundengrenze(id));

				if (res.meta.status === "success")
				{
					delete hourLimitdataList.value[id];
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
					const r = await $api.call(ApiStundengrenze.updateStundengrenze(currentValue.value));
					if (r.meta.status === "success")
					{
						hourLimitdataList.value[r.data[0].stundengrenze_id] = r.data[0];
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

		const hourlimitDataFrm = Vue.ref();

		const frmState = Vue.reactive({ grenzeBlurred: false, semesterBlurred: false, oeBlurred: false,  wasValidated: false });


		const validInput = (input) => {
			if (input === undefined || input === '')
				return false;
			else
				return true;
		}

		const validate = () => {
			frmState.semesterBlurred = true;
			frmState.grenzeBlurred = true;
			frmState.oeBlurred = true;
			if (validInput(currentValue.value.stundengrenze) &&
				validInput(currentValue.value.oe_kurzbz) &&
				validInput(currentValue.value.studiensemester_kurzbz)
			) {
				return true;
			}
			return false;
		}

		const showToast = () => {
            $fhcAlert.alertSuccess(t('person','stundengrenzeGespeichert'));
        }

        const showDeletedToast = () => {
            $fhcAlert.alertSuccess(t('person','stundengrenzeGeloescht'));
        }

        Vue.onMounted(() => {
            fetchStudiensemester();
            fetchOrgets();
        })

		return {
			hourLimitdataList,
			semesterList,
			oeList,
			hourlimitdataListArray,
			currentValue,
			readonly,
			frmState,
			dialogRef,
			hourlimitDataFrm,
			modalRef,

			validInput,
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
					<div class="h5"><h5>{{ t('person','stundengrenzen') }}</h5></div>        
				</div>

				<div class="card-body">
					<div class="d-grid d-md-flex justify-content-start py-2">
						<button type="button" class="btn btn-sm btn-primary" @click="showAddModal()">
						<i class="fa fa-plus"></i> {{ t('person','stundengrenze') }}
						</button>
					</div>
					<div class="table-responsive">
						<table class="table table-hover table-sm">
							<thead>                
							<tr>
								<th scope="col">{{ t('lehre','studiensemester') }}</th>
								<th scope="col">{{ t('lehre','organisationseinheit') }}</th>
								<th scope="col">{{ t('person','stundengrenze') }}</th>
								<th scope="col"></th>
							</tr>
							</thead>
							<tbody>
							<tr v-for="hourlimitdata in hourlimitdataListArray" :key="hourlimitdata.stundengrenze_id">
								<td class="align-middle">{{ hourlimitdata.studiensemester_kurzbz }}</td>
								<td class="align-middle">{{ hourlimitdata.oe_bezeichnung }}</td>
								<td class="align-middle">{{ hourlimitdata.stundengrenze }}</td>
								<td class="align-middle" width="5%">
									<div class="d-grid gap-2 d-md-flex align-middle">
										<button type="button" class="btn btn-outline-secondary btn-sm" @click="showEditModal(hourlimitdata.stundengrenze_id)">
											<i class="fa fa-pen"></i>
										</button>
										<button type="button" class="btn btn-outline-secondary btn-sm" @click="showDeleteModal(hourlimitdata.stundengrenze_id)">
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
	<Modal :title="t('person','stundengrenze')" ref="modalRef" class="stundengrenzeModal">
		<template #body>
			<form class="row g-3" ref="hourlimitDataFrm">

				<div class="col-md-4">
					<label for="studiensemester_kurzbz" class="required form-label">{{ t('lehre','studiensemester') }}</label><br>
					<select v-if="!readonly" id="studiensemester_kurzbz" @blur="frmState.oeBlurred = true"  :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validInput(currentValue.studiensemester_kurzbz) && frmState.semesterBlurred}" v-model="currentValue.studiensemester_kurzbz" class="form-select form-select-sm" aria-label=".form-select-sm " >
						<option v-for="(item, index) in semesterList" :value="item.studiensemester_kurzbz">
							{{ item.bezeichnung }}
						</option>
					</select>
					<input v-else type="text" readonly class="form-control-sm form-control-plaintext" id="studiensemester_kurzbz" :value="currentValue.studiensemester_kurzbz">
				</div>

				<div class="col-md-4">
					<label for="oe_kurzbz" class="required form-label">{{ t('lehre','organisationseinheit') }}</label><br>
					<select v-if="!readonly" id="oe_kurzbz" @blur="frmState.oeBlurred = true"  :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validInput(currentValue.oe_kurzbz) && frmState.oeBlurred}" v-model="currentValue.oe_kurzbz" class="form-select form-select-sm" aria-label=".form-select-sm " >
						<option :value="null">{{ t('core','alleOrganisationseinheiten') }}</option>
						<option v-for="(item, index) in oeList" :value="item.value">
							{{ item.label }}
						</option>
					</select>
					<input v-else type="text" readonly class="form-control-sm form-control-plaintext" id="oe_kurzbz" :value="currentValue.oe_kurzbz">
				</div>

				<div class="col-md-4">
					<label for="stundengrenze" class="required form-label">{{ t('person','stundengrenze') }}</label>
					<input type="number" :readonly="readonly" @blur="frmState.grenzeBlurred = true" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validInput(currentValue.stundengrenze) && frmState.grenzeBlurred}" id="stundengrenze" v-model="currentValue.stundengrenze">
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
	  	{{ t('person','stundengrenzeNochNichtGespeichert') }}
	  </template>
	</ModalDialog>

	`
}

export default HourLimitData;