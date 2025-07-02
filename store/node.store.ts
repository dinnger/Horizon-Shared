import { glob } from 'glob'
import { fileURLToPath } from 'node:url'
import type { newClassInterface } from '../interfaces/class.interface.js'

import path from 'node:path'
const dirPath = path.join(__dirname, '../plugins/nodes/')
const files = glob.sync('**/index.js', { cwd: dirPath })

const nodesClass: { [key: string]: newClassInterface } = {}
const nodesDependencies: { [key: string]: string[] } = {}

for (const file of files) {
	if (file && file.replace(/\\/g, '/').indexOf('/_') > -1) continue
	const type = file
		.replace(/\\/g, '/')
		.toString()
		.replace(`${dirPath.replace(/\\/g, '/')}/`, '')
		.split('/')
		.slice(0, -1)
		.join('/')
	const module = require(`${path.resolve(dirPath, file)}`)
	const model = module.default

	try {
		const data = new model()
		nodesClass[type] = {
			type,
			info: data.info,
			group: data.info.group,
			dependencies: data.dependencies,
			properties: data.properties,
			credentials: data.credentials,
			credentialsActions: data.credentialsActions,
			class: model
		}
	} catch (error) {
		console.log(`Error al cargar el nodo ${file}`, error)
	}
}

export function getNodeClass() {
	return Object.fromEntries(
		Object.entries(nodesClass).map(([key, value]) => [
			key,
			{ ...value, typeDescription: Array.isArray(value.group) ? value.group.join('/') : value.group }
		])
	)
}

// Dependencias por nodo independiente de su clase
export function setNodeClassDependencies(node: string, dependencies: string[]) {
	nodesDependencies[node] = dependencies
}

export function getNodeClassDependencies(node: string): string[] {
	return nodesDependencies[node]
}
