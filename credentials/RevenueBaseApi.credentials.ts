import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class RevenueBaseApi implements ICredentialType {
	name = 'revenueBaseApi';

	displayName = 'RevenueBase API';

	documentationUrl = 'https://docs.revenuebase.ai/api-reference/authentication';

	icon: Icon = 'file:RevenueBase-Mark.png';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			placeholder: 'Your RevenueBase API key',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.revenuebase.ai',
			url: '/v1/credits',
		},
	};
}
