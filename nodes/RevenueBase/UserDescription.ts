import type { INodeProperties } from 'n8n-workflow';

export const userOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['user'],
			},
		},
		options: [
			{
				name: 'Get Credits',
				value: 'getCredits',
				description: 'Get the number of validation credits remaining on the account',
				action: 'Get remaining credit balance',
				routing: {
					request: {
						method: 'GET',
						url: '/v1/credits',
					},
				},
			},
			{
				name: 'Rotate API Key',
				value: 'rotateApiKey',
				description:
					'Generate a new API key and immediately invalidate the previous one. Update all integrations before using.',
				action: 'Rotate API key',
				routing: {
					request: {
						method: 'GET',
						url: '/v1/new-api-key',
					},
				},
			},
		],
		default: 'getCredits',
	},
];
