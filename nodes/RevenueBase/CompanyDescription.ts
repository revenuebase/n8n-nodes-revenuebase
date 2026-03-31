import type { INodeProperties } from 'n8n-workflow';

export const companyOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['company'],
			},
		},
		options: [
			{
				name: 'Discover',
				value: 'discover',
				description:
					'Search for companies using a keyword or natural-language description (up to 2,000 results ranked by similarity)',
				action: 'Discover companies by keyword',
			},
			{
				name: 'Resolve',
				value: 'resolve',
				description:
					'Match a company name to a verified record and return firmographic data',
				action: 'Resolve a company name',
			},
		],
		default: 'resolve',
	},
];

export const companyFields: INodeProperties[] = [
	// ── Resolve ──────────────────────────────────────────────────────
	{
		displayName: 'Company Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'RevenueBase Inc',
		description: 'The company name to resolve against the RevenueBase database',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['resolve'],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['resolve'],
			},
		},
		options: [
			{
				displayName: 'Headquarters City',
				name: 'headquarters_city',
				type: 'string',
				default: '',
				placeholder: 'San Francisco',
				description: 'Filter results to companies headquartered in this city (case-sensitive)',
			},
			{
				displayName: 'Headquarters Country',
				name: 'headquarters_country',
				type: 'string',
				default: '',
				placeholder: 'US',
				description:
					'Filter results to companies headquartered in this country (ISO 3166-1 alpha-2 code)',
			},
			{
				displayName: 'Headquarters State',
				name: 'headquarters_state',
				type: 'string',
				default: '',
				placeholder: 'CA',
				description: 'Filter results to companies headquartered in this state or region',
			},
			{
				displayName: 'Headquarters Street',
				name: 'headquarters_street',
				type: 'string',
				default: '',
				placeholder: '123 Main St',
				description: 'Filter results to companies headquartered at this street address',
			},
			{
				displayName: 'Headquarters Zip',
				name: 'headquarters_zip',
				type: 'string',
				default: '',
				placeholder: '94105',
				description: 'Filter results to companies headquartered in this postal code',
			},
			{
				displayName: 'Result Count',
				name: 'result_count',
				type: 'number',
				default: 3,
				description: 'Maximum number of matching records to return',
				typeOptions: {
					minValue: 1,
				},
			},
		],
	},

	// ── Discover ─────────────────────────────────────────────────────
	{
		displayName: 'Semantic Search',
		name: 'keyword',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'cloud security software',
		description: 'Keywords or natural-language description to search companies by',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['discover'],
			},
		},
	},
	{
		displayName: 'Result Count',
		name: 'result_count',
		type: 'number',
		default: 10,
		description: 'Number of results to return. Must be between 1 and 2000.',
		typeOptions: {
			minValue: 1,
			maxValue: 2000,
		},
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['discover'],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['discover'],
			},
		},
		options: [
			{
				displayName: 'Headquarters City',
				name: 'headquarters_city',
				type: 'string',
				default: '',
				placeholder: 'San Francisco',
				description: 'Filter results to companies headquartered in this city (case-sensitive)',
			},
			{
				displayName: 'Headquarters Country',
				name: 'headquarters_country',
				type: 'string',
				default: '',
				placeholder: 'US',
				description:
					'Filter results to companies headquartered in this country (ISO 3166-1 alpha-2 code)',
			},
			{
				displayName: 'Headquarters State',
				name: 'headquarters_state',
				type: 'string',
				default: '',
				placeholder: 'CA',
				description: 'Filter results to companies headquartered in this state or region',
			},
			{
				displayName: 'Headquarters Street',
				name: 'headquarters_street',
				type: 'string',
				default: '',
				placeholder: '123 Main St',
				description: 'Filter results to companies headquartered at this street address',
			},
			{
				displayName: 'Headquarters Zip',
				name: 'headquarters_zip',
				type: 'string',
				default: '',
				placeholder: '94105',
				description: 'Filter results to companies headquartered in this postal code',
			},
		],
	},
];
