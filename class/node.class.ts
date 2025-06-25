import type { IPropertiesType } from '../interfaces/workflow.properties.interface.js'
import type { IConnection, IMetaNode, INode, INodeCanvas, INodeClass } from '../interfaces/workflow.interface.js'
import { utils_standard_name } from '../utils/utilities.js'

export class NewNode implements INodeCanvas {
	name: string
	type: string
	x: number
	y: number
	width: number
	height: number
	color: string
	icon: string
	inputs: string[]
	outputs: string[]
	properties?: IPropertiesType
	meta?: IMetaNode
	connections: IConnection[]
	isManual?: boolean
	id: string
	constructor(value: INode) {
		this.id = value.id
		this.name = utils_standard_name(value.name)
		this.type = value.type
		this.x = value.x
		this.y = value.y
		this.width = value.width
		this.color = value.color
		this.icon = value.icon
		this.inputs = value.inputs
		this.outputs = value.outputs
		this.properties = value.properties
		this.meta = value.meta
		this.connections = value.connections
		this.height = this.calculateNodeHeight()
	}

	calculateNodeHeight() {
		const widthByInputs = Math.max(35 + (this.inputs?.length || 0) * 20, 85)
		const widthByOutputs = Math.max(35 + (this.outputs?.length || 0) * 20, 85)
		return Math.max(widthByInputs, widthByOutputs)
	}

	// Actualiza el height del nodo y resetea las conexiones
	update() {
		this.height = this.calculateNodeHeight()
		for (const connection of this.connections) {
			connection.pointers = null
		}
	}
	// Actualiza las conexiones
	updateConnectionsOutput({ before, after }: { before: string[]; after: string[] }) {
		if (before.length !== after.length) return
		for (let i = 0; i < before.length; i++) {
			if (before[i] !== after[i] && before.filter((f) => f === before[i]).length === 1) {
				const connections = this.connections.filter((f) => f.id_node_origin === this.id && f.output === before[i])
				for (const connection of connections) {
					connection.output = after[i]
					this.update()
				}
			}
		}
		//     for (let i = 0; i < before.length; i++) {
		// 	const connection = this.connections.find(f => f.output === before[i])
		// 	if (connection) {
		// 		connection.output = after[i]
		// 		connection.update()
		// 	}
		// }
	}
}

export class VirtualNode implements INodeClass {
	name: string
	type: string
	x: number
	y: number
	properties?: IPropertiesType
	meta?: IMetaNode
	isManual?: boolean
	id: string
	class: any
	constructor(value: INodeClass) {
		this.id = value.id
		this.name = utils_standard_name(value.name)
		this.type = value.type
		this.x = value.x
		this.y = value.y
		this.properties = value.properties
		this.meta = value.meta
		this.class = value.class
	}

	/**
	 * Actualiza la información de la propiedad
	 */
	update() {
		if (!this.properties) return
		for (const [key, value] of Object.entries(this.properties)) {
			if ('onTransform' in value && value.onTransform) {
				this.properties[key].value =
					typeof value.onTransform === 'function' ? value.onTransform(this.properties[key].value) : utils_standard_name(String(this.properties[key].value))
			}
			if (this.properties[key].type === 'list') {
				const objets = this.properties[key].object
				for (const keyObject in objets) {
					const obj = objets[keyObject]
					if ('onTransform' in obj && obj.onTransform) {
						for (const keyProperty in this.properties[key].value) {
							const item = this.properties[key].value[keyProperty]
							const transform = typeof obj.onTransform === 'function' ? obj.onTransform(item[keyObject].value) : utils_standard_name(String(item[keyObject].value))
							item[keyObject].value = transform
						}
					}
				}
			}
		}
	}
}
