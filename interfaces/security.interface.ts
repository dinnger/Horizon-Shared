export interface IRole {
	id: number
	name: string
	description: string
	tags: string[]
	user: {
		id: number
		name: string
		alias: string
	}
	status: {
		id: number
		name: string
		color: string
	}
}
