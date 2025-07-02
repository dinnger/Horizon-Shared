import type { Express } from 'express'
import type { IPropertiesType } from './workflow.properties.interface.js'
import type { IClientActionResponse, IClientService } from './client.interface.js'
import type { IMetaNode } from './workflow.interface.js'
import type { IWorkflowExecutionContextInterface, IWorkflowExecutionInterface } from './workflow.execute.interface.js'

export type SubscriberType =
	| 'getVirtualProperties'
	| 'getVirtualNodes'
	| 'getVirtualConnections'
	| 'getVirtualProject'
	| 'statusWorkflow'
	| 'infoWorkflow'
	| 'propertyWorkflow'
	| 'connectionError'
	| 'changePosition'
	| 'changeMeta'
	| 'addNode'
	| 'duplicateNode'
	| 'removeNode'
	| 'updateNode'
	| 'actionNode'
	| 'dataNode'
	| 'statsNode'
	| 'propertyNode'
	| 'addConnection'
	| 'removeConnection'
	// Actions
	| 'actionDebug'
	// Eventos
	| 'trace' // trace: Mostrar la animación de los nodos
	| 'memory' // memory: Mostrar la memoria del proceso
	| 'getDebug' // debug: Mostrar la información de depuración
	| 'getLogs'

export interface classBaseEnvironmentInterface {
	baseUrl: string
	serverUrl: string
	isDev: boolean
	isSubFlow: boolean
	subFlowBase: string
	subFlowParent: string
}

export interface classDependencyInterface {
	getRequire: (name: string) => Promise<any>
	getModule: ({ path, name }: { path: string; name: string }) => Promise<any>
	getSecret: ({ type, subType, name }: { type: string; subType?: string; name?: string }) => Promise<any>
	listSecrets: ({ type, subType }: { type: string; subType?: string }) => Promise<any>
}

export interface classCredentialInterface {
	getCredential: (name: string) => any
}

export interface classOnCreateInterface {
	context: IWorkflowExecutionContextInterface
	environment: classBaseEnvironmentInterface
	dependency: classDependencyInterface
}

export interface classOnActionsInterface {
	dependency: classDependencyInterface
}

export interface classOnExecuteInterface {
	app: Express
	context: IWorkflowExecutionContextInterface
	execute: IWorkflowExecutionInterface
	logger: {
		info: (...args: unknown[]) => void
		error: (...args: unknown[]) => void
	}
	environment: classBaseEnvironmentInterface
	dependency: classDependencyInterface
	inputData: { idNode: string; inputName: string; data: object }
	outputData: (outputName: string, data: object, meta?: object) => void
	credential: classCredentialInterface
}

export interface classOnCredential {
	action: string
	dependency: classDependencyInterface
	client: IClientService
}
export interface INodeConnectors {
	inputs?: { name: string; nextNodeTag?: string }[] | Record<string, any>
	outputs: { name: string; nextNodeTag?: string }[] | Record<string, any>
	callbacks?: { name: string; nextNodeTag?: string }[] | Record<string, any>
}

export type IClassOnCredentialResponse = Promise<IClientActionResponse>

/**
 * Represents the information about a plugin.
 *
 * @interface infoInterface
 * @property {string} title - The title of the plugin.
 * @property {string} desc - The description of the plugin.
 * @property {string} icon - The icon associated with the plugin.
 * @property {string} group - The group to which the plugin belongs.
 * @property {string} color - The color associated with the plugin.
 * @property {boolean} [isTrigger] - Indicates if the plugin is a trigger.
 * @property {boolean} [isSingleton] - Indicates if the plugin maintains a single instance of execution per input.
 * @property {string[]} inputs - The list of input connections for the plugin.
 * @property {string[]} outputs - The list of output connections for the plugin.
 */
export interface infoInterface {
	name: string
	desc: string
	icon: string
	group: string
	color: string
	/**
		Si es true, el nodo reinicia las ejecuciones y la información de los nodos siguientes
	*/
	isTrigger?: boolean
	/**
		Si es true, significa que el nodo mantiene una instancia de ejecución por cada entrada
	*/
	isSingleton?: boolean

	connectors: INodeConnectors
}

/**
 * Interface representing a class node with configurable properties and credentials.
 *
 * @template T - The type of properties this node will have, defaults to IPropertiesType
 * @template C - The type of credentials this node will have, defaults to IPropertiesType
 */
export interface IClassNode<T extends IPropertiesType = IPropertiesType, C extends IPropertiesType = IPropertiesType> {
	/**
	 * Determines if the node can access secrets
	 */
	accessSecrets?: boolean

	/**
	 * List of dependency identifiers required by this node
	 */
	dependencies?: string[]

	/**
	 * Information about the node
	 */
	info: infoInterface

	/**
	 * Configuration properties for the node.
	 * These define the node's behavior and settings.
	 */
	properties: T

	/**
	 * Authentication credentials required by the node
	 */
	credentials?: C

	/**
	 * List of credential actions
	 */
	credentialsActions?: { name: string; label: string }[] | string[]

	/**
	 * Additional metadata for the node
	 */
	meta?: IMetaNode

	/**
	 * Action handlers mapped by action names
	 */
	onAction?(o: classOnActionsInterface): Promise<{
		[key: string]: () => Promise<any>
	}>

	/**
	 * Lifecycle method called when the node is deployed
	 */
	onDeploy?(): void

	/**
	 * Lifecycle method called when the node is created
	 * @param o - Creation context and parameters
	 * @returns A promise that resolves when creation is complete
	 */
	onCreate?(o: classOnCreateInterface): Promise<void>

	/**
	 * Lifecycle method called when the node is executed
	 * @param o - Execution context and parameters
	 * @returns A promise that resolves when execution is complete
	 */
	onExecute(o: classOnExecuteInterface): Promise<void>

	/**
	 * Lifecycle method called for credential handling
	 * @param o - Credential context and parameters
	 * @returns A promise that resolves with credential processing results
	 */
	onCredential?(o: classOnCredential): IClassOnCredentialResponse

	/**
	 * Lifecycle method called when the node is destroyed
	 */
	onDestroy?(): void
}

export interface newClassInterface extends Omit<IClassNode, 'onExecute'> {
	type: string
	group?: string | string[]
	dependencies?: string[]
	class: IClassNode
}
