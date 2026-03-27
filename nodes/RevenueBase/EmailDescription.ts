import type { INodeProperties } from 'n8n-workflow';

export const emailOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['email'],
			},
		},
		options: [
			{
				name: 'Validate',
				value: 'validate',
				description: 'Validate a single email address for deliverability',
				action: 'Validate an email address',
			},
		],
		default: 'validate',
	},
];

export const emailFields: INodeProperties[] = [
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'name@example.com',
		description: 'The email address to validate',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['validate'],
			},
		},
	},
	{
		displayName: 'Metadata',
		name: 'metadata',
		type: 'boolean',
		default: false,
		description: 'Whether to include additional details such as MX records and email provider information in the response',
		displayOptions: {
			show: {
				resource: ['email'],
				operation: ['validate'],
			},
		},
	},
];
