import type { IPropertiesType } from './workflow.properties.interface.js'

export interface classOnExecuteInterface {
	context: {
		path: string
		flow: string
	}
}

export interface infoInterface {
	title: string
	desc: string
	icon: string
}

export interface classDeployInterface {
	info: infoInterface
	properties: IPropertiesType
	meta?: { [key: string]: any }
	onExecute(o: classOnExecuteInterface): Promise<void>
}

export interface newClassDeployInterface
	extends Omit<classDeployInterface, 'onExecute'> {
	name: string
	dependencies?: string[]
	class: classDeployInterface
}
