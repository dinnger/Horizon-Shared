import type { IClassNode, classOnCreateInterface, classOnExecuteInterface, infoInterface } from '@shared/interfaces/class.interface.js'
import type { ICodeProperty, IOptionsProperty, IPropertiesType, ISecretProperty } from '@shared/interfaces/workflow.properties.interface.js'

type IDialect = 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'oracle'

interface IProperties extends IPropertiesType {
	dialect: IOptionsProperty
	connection: IOptionsProperty
	config: ICodeProperty
	configSecret: ISecretProperty
	query: ICodeProperty
	replacements: ICodeProperty
}

interface ICredentials extends IPropertiesType {
	database: IOptionsProperty
	config: ICodeProperty
}

export default class DatabaseNode implements IClassNode<IProperties, ICredentials> {
	constructor(
		public accessSecrets: boolean,
		public dependencies: string[],
		public info: infoInterface,
		public properties: IProperties,
		public credentials: ICredentials,
		private connections: Record<string, any> = {}
	) {
		this.accessSecrets = true
		this.dependencies = ['sequelize']
		this.info = {
			name: 'Database',
			desc: 'Interactúa con bases de datos usando Sequelize.',
			icon: '󰆼',
			group: 'Base de Datos',
			color: '#52b0e7',
			connectors: {
				inputs: ['input'],
				outputs: ['response', 'error']
			},
			isSingleton: true
		}

		this.properties = {
			dialect: {
				name: 'Dialecto',
				type: 'options',
				options: [
					{
						label: 'Mysql',
						value: 'mysql'
					},
					{
						label: 'Postgres',
						value: 'postgres'
					},
					{
						label: 'SQLite',
						value: 'sqlite'
					},
					{
						label: 'MariaDB',
						value: 'mariadb'
					},
					{
						label: 'MSSQL',
						value: 'mssql'
					},
					{
						label: 'Oracle',
						value: 'oracle'
					}
				],
				value: 'postgres'
			},
			connection: {
				name: 'Tipo de conexión',
				type: 'options',
				options: [
					{
						label: 'Manual',
						value: 'manual'
					},
					{
						label: 'Secreto',
						value: 'secret'
					}
				],
				value: 'manual'
			},
			config: {
				name: 'Configuración',
				type: 'code',
				lang: 'json',
				value: `{
          "host": "localhost",
          "username": "user",
          "password": "password",
          "database": "mydatabase",
          "port": 5432,
          "logging": false
        }`
			},
			configSecret: {
				name: 'Configuración',
				type: 'secret',
				secretType: 'DATABASE',
				options: [],
				value: '',
				show: false
			},
			query: {
				name: 'Query',
				type: 'code',
				lang: 'sql',
				value: 'select * from users where id = :id'
			},
			replacements: {
				name: 'Replacements',
				type: 'code',
				lang: 'json',
				value: '{\n  "id": 1\n}'
			},
			keepAlive: {
				name: 'Mantener conexión',
				type: 'switch',
				value: true
			}
		}

		this.credentials = {
			database: {
				name: 'Database',
				type: 'options',
				options: [
					{
						label: 'Postgres',
						value: 'postgres'
					},
					{
						label: 'MySQL',
						value: 'mysql'
					},
					{
						label: 'SQLite',
						value: 'sqlite'
					},
					{
						label: 'MariaDB',
						value: 'mariadb'
					},
					{
						label: 'Oracle',
						value: 'oracle'
					}
				],
				value: 'postgres'
			},
			config: {
				name: 'Configuración de conexión',
				type: 'code',
				lang: 'json',
				value: `{ 
    "database": "mydb",
    "user": "myuser",
    "password": "mypass",
    "host": "localhost"
}
`
			}
		}
	}

	async onDeploy() {
		switch (this.properties.dialect.value) {
			case 'mysql':
				this.dependencies.push('mysql')
				break
			case 'postgres':
				this.dependencies.push('pg')
				break
			case 'sqlite':
				this.dependencies.push('sqlite3')
				break
			case 'mariadb':
				this.dependencies.push('mariadb')
				break
			case 'mssql':
				this.dependencies.push('tedious')
				break
			case 'oracle':
				this.dependencies.push('oracledb')
				break
		}
	}

	async onCreate({ dependency }: classOnCreateInterface): Promise<void> {
		if (this.properties.connection.value === 'secret') {
			this.properties.configSecret.show = true
			this.properties.config.show = false
			const secrets = await dependency.listSecrets({
				type: 'database',
				subType: String(this.properties.dialect.value)
			})
			if (secrets) {
				this.properties.configSecret.options = secrets
			}
		}
		if (this.properties.connection.value === 'manual') {
			this.properties.config.show = true
			this.properties.configSecret.show = false
		}
	}

	async onExecute({ outputData, dependency }: classOnExecuteInterface) {
		const { Sequelize, QueryTypes } = await dependency.getRequire('sequelize')
		let sequelize: typeof Sequelize | null = null

		try {
			const dialect: IDialect = this.properties.dialect.value as IDialect

			if (this.properties.connection.value === 'secret') {
				if (!this.properties.configSecret.value) {
					return outputData('error', { error: 'No se especificó el secreto' })
				}
				const [type, subType, name] = this.properties.configSecret.value.toString().split('_')
				const secrets = await dependency.getSecret({ type, subType, name })
				if (!secrets) {
					return outputData('error', { error: 'No se encontraron secretos' })
				}
				this.properties.config.value = Object.fromEntries(Object.entries(secrets).map(([k, v]) => [k.toLowerCase(), v]))
			}

			const config: {
				[key: string]: any
			} = this.properties.config.value as object
			let replacements: any = {}
			try {
				replacements = JSON.parse(String(this.properties.replacements.value))
			} catch (error) {}

			const query: string = this.properties.query.value as string

			if (dialect === 'sqlite') {
				config.storage = config.storage || './database.sqlite'
			}

			if (dialect === 'oracle' && config?.connectString) {
				config.dialectOptions = config.dialectOptions || {}
				config.dialectOptions.connectString = config.connectString
			}

			// hash de config
			const configHash = btoa(JSON.stringify(config))
			if (this.connections[configHash]) {
				sequelize = this.connections[configHash]
			} else {
				sequelize = new Sequelize({
					...config,
					dialect,
					logging: config.logging === undefined ? false : config.logging
				})
				this.connections[configHash] = sequelize
			}

			const isSelect = query.toUpperCase().trim().startsWith('SELECT')
			const result = await sequelize.query(this.properties.query.value as string, {
				type: isSelect ? QueryTypes.SELECT : undefined,
				replacements: replacements || undefined,
				logging: config.logging === undefined ? false : config.logging
			})
			outputData('response', isSelect ? result : result[0])
		} catch (error) {
			let message = 'Error: '
			if (error instanceof Error) message += error.message
			outputData('error', { error: message })
		} finally {
			if (sequelize && !this.properties.keepAlive.value) {
				await sequelize.close()
			}
		}
	}

	// async onCredential() {
	// 	const { database, config } = this.credentials
	// 	// Las credenciales se definen directamente en la configuración del nodo de credenciales.
	// 	// Este método podría usarse para validaciones adicionales si fuera necesario.
	// 	return {
	// 		database: database.value,
	// 		config: config.value
	// 	}
	// }
}
