import type { IPropertiesType } from '../../interfaces/workflow.properties.interface.js'
import type {
	classDeployInterface,
	classOnExecuteInterface,
	infoInterface
} from '@shared/interfaces/classDeploy.interface.js'

export default class implements classDeployInterface {
	// ===============================================
	// Dependencias
	// ===============================================
	// ===============================================
	constructor(
		public info: infoInterface,
		public properties: IPropertiesType,
		public meta: {
			nodesExecuted?: Set<string>
			executeData?: Map<string, { data: object; meta?: object; time: number }>
		} = {}
	) {
		this.info = {
			title: 'Docker',
			desc: 'Despliega el flujo en un contenedor docker.',
			icon: '󰡨'
		}

		this.properties = {
			type: {
				name: 'Tipo de validación de paralelismo:',
				type: 'options',
				options: [
					{
						label: 'Esperar todas las ejecuciones',
						value: 'allParallel'
					},
					{
						label: 'Primer resultado',
						value: 'firstParallel'
					}
				],
				value: 'allParallel'
			}
		}
	}

	async onExecute({ context }: classOnExecuteInterface) {}
}
