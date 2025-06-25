import type { IPropertiesType } from '@shared/interfaces/workflow.properties.interface.js'
import type { IClassNode, classOnExecuteInterface, infoInterface } from '@shared/interfaces/class.interface.js'
import { mime } from './mimeTypes.js'
import { statusCode } from './statusCodeTypes.js'

export default class implements IClassNode {
	constructor(
		public info: infoInterface,
		public properties: IPropertiesType
	) {
		this.info = {
			title: 'Response',
			desc: 'Devuelve la respuesta de una llamada webhook',
			icon: '󰌑',
			group: 'Input/Output',
			color: '#F39C12',
			inputs: ['input'],
			outputs: ['response', 'error']
		}

		this.properties = {
			// propiedadad content type
			contentType: {
				name: 'Content Type',
				type: 'options',
				description: 'Tipo de contenido de la respuesta',
				value: 'application/json',
				options: mime,
				size: 2,
				disabled: false
			},
			status: {
				name: 'Código:',
				type: 'options',
				value: 200,
				options: statusCode,
				size: 1
			},
			isFile: {
				name: 'Es Archivo:',
				type: 'switch',
				value: false,
				size: 1
			},
			nameFile: {
				name: 'Nombre Archivo (con extensión):',
				type: 'string',
				value: '',
				size: 4,
				show: false
			},
			response: {
				name: 'Respuesta',
				type: 'code',
				lang: 'json',
				value: '{\n}'
			},
			header: {
				name: 'Headers',
				type: 'code',
				lang: 'json',
				value: '{\n}',
				show: true
			}
		}
	}

	async onCreate() {
		this.properties.nameFile.show = false
		this.properties.header.show = true
		this.properties.contentType.disabled = false

		if (this.properties.isFile.value) {
			this.properties.nameFile.show = true
			this.properties.header.show = false
			this.properties.contentType.value = 'application/octet-stream'
			this.properties.contentType.disabled = true
		}
	}

	async onExecute({ execute, logger, outputData }: classOnExecuteInterface) {
		let node = execute.getNodeByType('integration/webhook')
		if (!node) node = execute.getNodeByType('integration/crud')
		if (!node) node = execute.getNodeByType('integration/soap')
		if (!node) return outputData('error', { error: 'No se encontró el nodo' })

		try {
			const ifExecute = execute.ifExecute()
			if (!ifExecute) {
				const response = this.properties.response.value
				// logger.info(response)
				// agregar el content type a la respuesta node.meta.res proveniente de express
				const contentType = this.properties.contentType.value
				const headers = this.properties.header.value
				// Omitiendo si es test
				if (!execute.isTest) {
					if (!node.meta || !node.meta.res) return outputData('error', { error: 'No se encontró el nodo' })
					node.meta.res.set('Content-Type', contentType)
					// for (const key of Object.keys(headers)) {
					// 	node.meta.res.set(key, headers[key]);
					// }
					if (this.properties.isFile.value) {
						node.meta.res.set('Content-Disposition', `attachment; filename="${this.properties.nameFile.value}"`)
					}
					node.meta.res.status(Number.parseInt(this.properties.status.value as string)).send(response)
				}
				return outputData('response', {
					statusCode: this.properties.status.value,
					response,
					contentType
				})
			}
		} catch (error) {
			let message = 'Error'
			if (error instanceof Error) message = error.toString()
			outputData('error', { statusCode: 500, error: message })
			// logger.error({ responseTime: this.meta?.accumulativeTime }, message)
			if (node?.meta?.res && message.indexOf('ERR_HTTP_HEADERS_SENT') === -1) node.meta.res.status(500).send('Error en respuesta ')
		}
	}
}
