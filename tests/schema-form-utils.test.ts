import { describe, expect, it } from 'vitest'

import {
  parseArrayValue,
  parseSchemaFormValues,
  type JsonSchemaInput
} from '../src/renderer/src/components/forms/schema-form-utils'

describe('schema-form-utils', () => {
  it('parses array values for numbers and booleans', () => {
    expect(parseArrayValue('1\n2\nabc', 'number')).toEqual([1, 2, 'abc'])
    expect(parseArrayValue('true\nfalse\nTRUE', 'boolean')).toEqual([true, false, true])
    expect(parseArrayValue('a\nb', 'string')).toEqual(['a', 'b'])
  })

  it('parses schema form values with required and optional fields', () => {
    const schema: JsonSchemaInput = {
      type: 'object',
      required: ['name', 'count'],
      properties: {
        name: { type: 'string' },
        count: { type: 'number' },
        enabled: { type: 'boolean' },
        tags: { type: 'array', items: { type: 'string' } },
        thresholds: { type: 'array', items: { type: 'number' } }
      }
    }

    const values = {
      name: 'tool-a',
      count: '3',
      enabled: 'true',
      tags: 'alpha\nbeta',
      thresholds: '1\n2\nx',
      unused: ''
    }

    expect(parseSchemaFormValues(values, schema)).toEqual({
      name: 'tool-a',
      count: 3,
      enabled: true,
      tags: ['alpha', 'beta'],
      thresholds: [1, 2, 'x']
    })
  })

  it('keeps invalid numeric required values as strings and drops empty optional values', () => {
    const schema: JsonSchemaInput = {
      type: 'object',
      required: ['count'],
      properties: {
        count: { type: 'number' },
        note: { type: 'string' }
      }
    }

    const values = {
      count: 'not-a-number',
      note: '   '
    }

    expect(parseSchemaFormValues(values, schema)).toEqual({
      count: 'not-a-number'
    })
  })
})
