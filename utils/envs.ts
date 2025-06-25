import dotenv from 'dotenv'
dotenv.config()

type environments = 'development' | 'production'

interface envInterface {
	NODE_ENV: environments
	SERVER_CLUSTERS: number
	SERVER_PORT: number
	SERVER_URL: string
	SERVER_BASE: string
	WORKER_INIT_PORT: number
	WORKER_TRACE: boolean
	DATABASE_DIALECT: 'postgres' | 'sqlite'
	DATABASE_STORAGE?: string
	DATABASE_URL: string
}

const envs = {
	NODE_ENV: process.env.NODE_ENV as environments,
	SERVER_CLUSTERS: process.env.SERVER_CLUSTERS,
	SERVER_PORT: process.env.SERVER_PORT,
	SERVER_URL: process.env.SERVER_URL,
	SERVER_BASE: process.env.SERVER_BASE,
	WORKER_INIT_PORT: process.env.WORKER_INIT_PORT,
	WORKER_TRACE: process.env.WORKER_TRACE,
	DATABASE_DIALECT: process.env.DATABASE_DIALECT,
	DATABASE_STORAGE: process.env.DATABASE_STORAGE,
	DATABASE_URL: process.env.DATABASE_URL
}

const validEnvironments: environments[] = ['development', 'production']
const errors: string[] = []

if (!envs.NODE_ENV) {
	errors.push('NODE_ENV no definido')
}

if (envs.NODE_ENV && !validEnvironments.includes(envs.NODE_ENV)) {
	errors.push(`NODE_ENV no válido (${validEnvironments.join(', ')})`)
}

if (!envs.SERVER_CLUSTERS || Number.parseInt(envs.SERVER_CLUSTERS) < 1) {
	errors.push('SERVER_CLUSTERS no definido')
}
if (!envs.SERVER_PORT || Number.parseInt(envs.SERVER_PORT) < 1) {
	errors.push('SERVER_PORT no definido')
}
if (!envs.SERVER_URL) {
	errors.push('SERVER_URL no definido')
}
// validar path como url con regex (https o http)
const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/i
if (envs.SERVER_URL && !urlRegex.test(envs.SERVER_URL)) {
	errors.push('SERVER_URL no es una URL válida')
}

if (!envs.SERVER_BASE) {
	errors.push('SERVER_BASE no definido')
}

if (!envs.WORKER_INIT_PORT || Number.parseInt(envs.WORKER_INIT_PORT) < 1) {
	errors.push('WORKER_INIT_PORT no definido')
}
if (!envs.WORKER_TRACE || ['true', 'false'].indexOf(envs.WORKER_TRACE) < 0) {
	errors.push('WORKER_TRACE no definido')
}

// Solo aplica a development
if (envs.NODE_ENV === 'development') {
	if (!envs.DATABASE_DIALECT) {
		errors.push('DATABASE_DIALECT no definido')
	}
	if (
		envs.DATABASE_DIALECT &&
		!['postgres', 'sqlite'].includes(envs.DATABASE_DIALECT)
	) {
		errors.push('DATABASE_DIALECT no válido (postgres o sqlite)')
	}
	if (envs.DATABASE_DIALECT === 'sqlite' && !envs.DATABASE_STORAGE) {
		errors.push('DATABASE_STORAGE no definido')
	}
	if (envs.DATABASE_DIALECT === 'postgres' && !envs.DATABASE_URL) {
		errors.push('DATABASE_URL no definido')
	}
}

if (errors.length > 0) {
	console.error(errors.join('\n'))
	process.exit(1)
}

const result: envInterface = {
	NODE_ENV: envs.NODE_ENV,
	SERVER_URL: envs.SERVER_URL || '',
	SERVER_CLUSTERS: Number.parseInt(envs.SERVER_CLUSTERS || ''),
	SERVER_PORT: Number.parseInt(envs.SERVER_PORT || ''),
	SERVER_BASE: envs.SERVER_BASE || '',
	WORKER_INIT_PORT: Number.parseInt(envs.WORKER_INIT_PORT || ''),
	WORKER_TRACE: envs.WORKER_TRACE === 'true',
	DATABASE_DIALECT: envs.DATABASE_DIALECT as 'postgres' | 'sqlite',
	DATABASE_STORAGE: envs.DATABASE_STORAGE,
	DATABASE_URL: envs.DATABASE_URL || ''
}

export default result
