const schema = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	definitions: {
		// definición recursiva de “value”
		value: {
			enum: ['string', 'number', 'boolean', 'object', 'array', 'null']
		}
	},
	// el objeto raíz puede tener cualquier key,
	// pero su valor debe ajustarse a la definición “value”
	type: 'object',
	additionalProperties: { $ref: '#/definitions/value' }
}

export const validate = (data: any) => {
	const Ajv = require('ajv')
	const ajvFormats = require('ajv-formats')
	const ajvErrors = require('ajv-errors')
	const localize = require('ajv-i18n')
	const ajv = new Ajv({ allErrors: true })
	// Agregar soporte para formatos y mensajes de error personalizados
	ajvFormats(ajv)
	ajvErrors(ajv)
	const validate = ajv.compile(schema)
	try {
		const dataJson = typeof data === 'string' ? JSON.parse(data) : data
		const isValid = validate(dataJson)
		if (!isValid) {
			localize.es(validate.errors)
			return {
				error: ajv.errorsText(validate.errors, { separator: '\n' }).split('\n')
			}
		}
		return true
	} catch (error) {
		return { error }
	}
}
