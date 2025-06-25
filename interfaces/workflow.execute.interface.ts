import type {
	INodeClass,
	IWorkflowInfo,
	IWorkflowProject,
	IWorkflowProperties
} from './workflow.interface.js'

export interface IWorkflowExecutionProject {
	type: string
	config: { [key: string]: any }
}

export interface IWorkflowExecutionContextInterface {
	project?: IWorkflowProject
	info: IWorkflowInfo
	properties: IWorkflowProperties
	variables?: string[]
	secrets?: string[]
	currentNode: {
		id: string
		name: string
		type: string
		meta?: object
	} | null
	onCustomEvent?: (eventName: string, callback: (...args: any[]) => any) => any
}

export interface IWorkflowExecutionInterface {
	isTest: boolean
	getNodeById: (id: string) => INodeClass | null
	getNodeByType: (type: string) => {
		node: INodeClass

		meta?: { [key: string]: any }
		data: object
	} | null
	getNodesInputs: (idNode: string) => Set<string> | null
	getNodesOutputs: (idNode: string) => Set<string> | null
	getExecuteData: () => Map<
		string,
		{ data: object; meta?: object; time: number }
	>
	setExecuteData: (
		data: Map<string, { data: object; meta?: object; time: number }>
	) => void
	setGlobalData: ({
		type,
		key
	}: { type: string; key: string; value: any }) => void
	getGlobalData: ({ type, key }: { type: string; key: string }) => any
	deleteGlobalData: ({ type, key }: { type: string; key: string }) => void
	ifExecute: () => boolean
	stop: () => void
}
