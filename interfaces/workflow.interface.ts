import type { Model } from 'sequelize'
import type { IClassNode } from './class.interface.js'
import type { IWorkflowsFlowsEntity } from './entities/workflows.flows.interface.js'
import type { IPropertiesType } from './workflow.properties.interface.js'

interface Point {
	x: number
	y: number
}

export interface ICanvasPoint extends Point {
	button?: number
}

export interface ILog {
	logs?: {
		start?: {
			type: 'none' | 'info' | 'warn' | 'error' | 'debug'
			value: string
		}
		exec?: {
			type: 'none' | 'info' | 'warn' | 'error' | 'debug'
			value: string
		}
	}
}

export interface IMetaNode extends ILog {
	credentials?: string[]
}

export interface IConnection {
	id: string
	id_node_origin: string
	id_node_destiny: string
	input: string
	output: string
	pointers?: Point[] | null
	colorGradient?: any
	isFocused?: boolean
	isNew?: boolean
}

export interface INode {
	id: string
	name: string
	color: string
	icon: string
	type: string
	x: number
	y: number
	width: number
	height: number
	inputs: Array<string>
	outputs: Array<string>
	connections: Array<IConnection>
	properties?: IPropertiesType
	meta?: IMetaNode
	// Esto es para mostrar los datos en el cliente
	info?: {
		inputs: {
			data: { [key: string]: number }
			length: number
		}
		outputs: {
			data: { [key: string]: { value: number; changes: number } }
			length: number
		}
	}
}

export interface INodeNew
	extends Omit<
		INode,
		'id' | 'height' | 'width' | 'selected' | 'inputs' | 'outputs' | 'x' | 'y'
	> {
	id?: string
	x?: number
	y?: number
	height?: number
	width?: number
	inputs?: Array<string>
	outputs?: Array<string>
	show?: boolean
	typeDescription?: string
	temporal_pos?: ICanvasPoint
	isManual?: boolean
}

export interface INodeCanvas extends INode {
	update: () => void
	updateConnectionsOutput: ({
		before,
		after
	}: { before: string[]; after: string[] }) => void
}

// Utilizado en el worker
export interface INodeClass
	extends Omit<
		INode,
		'color' | 'icon' | 'width' | 'height' | 'inputs' | 'outputs' | 'connections'
	> {
	color?: string
	icon?: string
	width?: number
	height?: number
	inputs?: Array<string>
	outputs?: Array<string>
	connections?: Array<IConnection>
	class: IClassNode
	update?: () => void
}

export type IWorkflowProjectType = 'tcp' | 'rabbitMQ' | 'kafka'
export type IWorkflowProject = Record<IWorkflowProjectType, any>

export interface IWorkflowInfo {
	uid: string
	name: string
	disabled?: boolean
}

export interface IWorkflowProperties {
	basic: {
		router: string
		variables: { [key: string]: any }
	}
	deploy: number | null
}

export interface IWorkflow {
	project?: IWorkflowProject
	info: IWorkflowInfo
	properties: IWorkflowProperties
	nodes: { [key: string]: INode }
	connections: IConnection[]
	secrets: string[]
}

// Utilizado para los worker del cliente
export interface IWorkflowWorkerEntity
	extends Omit<IWorkflowsFlowsEntity, keyof Model> {
	worker_status?: 'Active' | 'Inactive'
}
