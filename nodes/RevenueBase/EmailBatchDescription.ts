import type { INodeProperties } from 'n8n-workflow';

export const emailBatchOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['emailBatch'],
			},
		},
		options: [
			{
				name: 'Cancel',
				value: 'cancel',
				description: 'Cancel a queued or processing batch job',
				action: 'Cancel a batch job',
			},
			{
				name: 'Download',
				value: 'download',
				description: 'Download the results of a completed batch job as binary data',
				action: 'Download batch job results',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'List all active batch jobs on the account',
				action: 'Get many batch jobs',
			},
			{
				name: 'Get Status',
				value: 'getStatus',
				description: 'Check the processing status of a batch job',
				action: 'Get batch job status',
			},
			{
				name: 'Upload',
				value: 'upload',
				description: 'Upload a CSV or JSON file of email addresses for bulk validation',
				action: 'Upload a batch file for email validation',
			},
		],
		default: 'upload',
	},
];

export const emailBatchFields: INodeProperties[] = [
	// processId — shared by getStatus, download, cancel
	{
		displayName: 'Process ID',
		name: 'processId',
		type: 'string',
		required: true,
		default: '',
		description: 'The process ID returned when the batch file was uploaded',
		displayOptions: {
			show: {
				resource: ['emailBatch'],
				operation: ['getStatus', 'download', 'cancel'],
			},
		},
	},

	// Upload: input binary field name
	{
		displayName: 'Input Data Field Name',
		name: 'inputDataFieldName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'The name of the incoming binary field containing the CSV or JSON file to upload',
		displayOptions: {
			show: {
				resource: ['emailBatch'],
				operation: ['upload'],
			},
		},
	},
	{
		displayName: 'Include Metadata',
		name: 'metadata',
		type: 'boolean',
		default: false,
		description: 'Whether to include extra metadata columns in the result file',
		displayOptions: {
			show: {
				resource: ['emailBatch'],
				operation: ['upload'],
			},
		},
	},

	// Download: output binary field name
	{
		displayName: 'Output Data Field Name',
		name: 'outputDataFieldName',
		type: 'string',
		default: 'data',
		description: 'The name of the output binary field that will contain the downloaded results file',
		displayOptions: {
			show: {
				resource: ['emailBatch'],
				operation: ['download'],
			},
		},
	},
];
