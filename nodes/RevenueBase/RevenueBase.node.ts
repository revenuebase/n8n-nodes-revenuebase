import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes } from 'n8n-workflow';

import { companyFields, companyOperations } from './CompanyDescription';
import { emailBatchFields, emailBatchOperations } from './EmailBatchDescription';
import { emailFields, emailOperations } from './EmailDescription';
import { userOperations } from './UserDescription';

const BASE_URL = 'https://api.revenuebase.ai';

export class RevenueBase implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'RevenueBase',
		name: 'revenueBase',
		icon: 'file:RevenueBase.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Verify emails, enrich companies, and manage your RevenueBase account',
		defaults: {
			name: 'RevenueBase',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'revenueBaseApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Company',
						value: 'company',
					},
					{
						name: 'Email Batch Job',
						value: 'emailBatch',
					},
					{
						name: 'Email Verification',
						value: 'email',
					},
					{
						name: 'User',
						value: 'user',
					},
				],
				default: 'email',
			},

			...emailOperations,
			...emailFields,

			...emailBatchOperations,
			...emailBatchFields,

			...companyOperations,
			...companyFields,

			...userOperations,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;

			try {
				let responseData: IDataObject | IDataObject[] = {};

				// ── Email Verification ─────────────────────────────────────
				if (resource === 'email') {
					if (operation === 'validate') {
						const email = this.getNodeParameter('email', i) as string;
						const metadata = this.getNodeParameter('metadata', i) as boolean;

						const options: IHttpRequestOptions = {
							method: 'POST',
							url: `${BASE_URL}/v2/email/verify`,
							headers: { 'Content-Type': 'application/json' },
							qs: metadata ? { metadata: true } : {},
							body: { email },
							json: true,
						};
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'revenueBaseApi',
							options,
						);
					}
				}

				// ── Email Batch Jobs ───────────────────────────────────────
				else if (resource === 'emailBatch') {
					if (operation === 'upload') {
						const inputDataFieldName = this.getNodeParameter(
							'inputDataFieldName',
							i,
						) as string;
						const includeMetadata = this.getNodeParameter('metadata', i) as boolean;

						const binaryData = this.helpers.assertBinaryData(i, inputDataFieldName);
						const fileBuffer = await this.helpers.getBinaryDataBuffer(i, inputDataFieldName);

						// Build multipart form data without external dependencies
						const boundary = `----FormBoundary${Date.now()}`;
						const filename = binaryData.fileName ?? 'emails.csv';
						const contentType = binaryData.mimeType ?? 'text/csv';

						const header = Buffer.from(
							`--${boundary}\r\nContent-Disposition: form-data; name="requested_file"; filename="${filename}"\r\nContent-Type: ${contentType}\r\n\r\n`,
						);
						const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
						const body = Buffer.concat([header, fileBuffer, footer]);

						const uploadOptions: IHttpRequestOptions = {
							method: 'POST',
							url: `${BASE_URL}/v2/email/verify/batch${includeMetadata ? '?metadata=true' : ''}`,
							headers: {
								'Content-Type': `multipart/form-data; boundary=${boundary}`,
							},
							body,
							json: true,
						};
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'revenueBaseApi',
							uploadOptions,
						);
					} else if (operation === 'getStatus') {
						const processId = this.getNodeParameter('processId', i) as string;

						const options: IHttpRequestOptions = {
							method: 'GET',
							url: `${BASE_URL}/v2/jobs/${parseInt(processId, 10)}`,
							json: true,
						};
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'revenueBaseApi',
							options,
						);
					} else if (operation === 'getMany') {
						const options: IHttpRequestOptions = {
							method: 'GET',
							url: `${BASE_URL}/v2/jobs`,
							json: true,
						};
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'revenueBaseApi',
							options,
						);
					} else if (operation === 'download') {
						const processId = this.getNodeParameter('processId', i) as string;
						const outputDataFieldName = this.getNodeParameter(
							'outputDataFieldName',
							i,
						) as string;

						const options: IHttpRequestOptions = {
							method: 'GET',
							url: `${BASE_URL}/v2/jobs/${parseInt(processId, 10)}/download`,
							encoding: 'arraybuffer',
							returnFullResponse: true,
						};
						const fullResponse = (await this.helpers.httpRequestWithAuthentication.call(
							this,
							'revenueBaseApi',
							options,
						)) as { headers: Record<string, string>; body: Buffer };

						// Derive filename from Content-Disposition header if present
						const disposition = fullResponse.headers['content-disposition'] ?? '';
						const filenameMatch = /filename[^;=\n]*=([^;\n]*)/.exec(disposition);
						const filename = filenameMatch
							? filenameMatch[1].replace(/['"]/g, '').trim()
							: `batch_${processId}.csv`;

						const binaryOutput = await this.helpers.prepareBinaryData(
							Buffer.isBuffer(fullResponse.body)
								? fullResponse.body
								: Buffer.from(fullResponse.body as unknown as ArrayBuffer),
							filename,
						);

						returnData.push({
							json: { processId, filename },
							binary: { [outputDataFieldName]: binaryOutput },
							pairedItem: { item: i },
						});
						continue;
					} else if (operation === 'cancel') {
						const processId = this.getNodeParameter('processId', i) as string;

						const options: IHttpRequestOptions = {
							method: 'POST',
							url: `${BASE_URL}/v2/jobs/${parseInt(processId, 10)}/cancel`,
							json: true,
						};
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'revenueBaseApi',
							options,
						);
					}
				}

				// ── Company ────────────────────────────────────────────────
				else if (resource === 'company') {
					if (operation === 'resolve') {
						const companyName = this.getNodeParameter('name', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as {
							result_count?: number;
							headquarters_country?: string;
							headquarters_state?: string;
							headquarters_city?: string;
							headquarters_street?: string;
							headquarters_zip?: string;
						};

						const body: Record<string, unknown> = { company_name: companyName };
						if (additionalFields.result_count) body.result_count = additionalFields.result_count;
						if (additionalFields.headquarters_country) body.headquarters_country = additionalFields.headquarters_country;
						if (additionalFields.headquarters_state) body.headquarters_state = additionalFields.headquarters_state;
						if (additionalFields.headquarters_city) body.headquarters_city = additionalFields.headquarters_city;
						if (additionalFields.headquarters_street) body.headquarters_street = additionalFields.headquarters_street;
						if (additionalFields.headquarters_zip) body.headquarters_zip = additionalFields.headquarters_zip;

						const options: IHttpRequestOptions = {
							method: 'POST',
							url: `${BASE_URL}/v2/organization/resolve`,
							headers: { 'Content-Type': 'application/json' },
							body,
							json: true,
						};
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'revenueBaseApi',
							options,
						);
					} else if (operation === 'discover') {
						const keyword = this.getNodeParameter('keyword', i) as string;
						const resultCount = this.getNodeParameter('result_count', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as {
							headquarters_country?: string;
							headquarters_state?: string;
							headquarters_city?: string;
							headquarters_street?: string;
							headquarters_zip?: string;
						};

						const body: Record<string, unknown> = { keyword, result_count: resultCount };
						if (additionalFields.headquarters_country) body.headquarters_country = additionalFields.headquarters_country;
						if (additionalFields.headquarters_state) body.headquarters_state = additionalFields.headquarters_state;
						if (additionalFields.headquarters_city) body.headquarters_city = additionalFields.headquarters_city;
						if (additionalFields.headquarters_street) body.headquarters_street = additionalFields.headquarters_street;
						if (additionalFields.headquarters_zip) body.headquarters_zip = additionalFields.headquarters_zip;

						const options: IHttpRequestOptions = {
							method: 'POST',
							url: `${BASE_URL}/v2/organization/discover`,
							headers: { 'Content-Type': 'application/json' },
							body,
							json: true,
						};
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'revenueBaseApi',
							options,
						);
					}
				}

				// ── User ───────────────────────────────────────────────────
				else if (resource === 'user') {
					if (operation === 'getCredits') {
						const options: IHttpRequestOptions = {
							method: 'GET',
							url: `${BASE_URL}/v2/account/balance`,
							json: true,
						};
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'revenueBaseApi',
							options,
						);
					} else if (operation === 'rotateApiKey') {
						const options: IHttpRequestOptions = {
							method: 'POST',
							url: `${BASE_URL}/v2/account/api-keys/rotate`,
							json: true,
						};
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'revenueBaseApi',
							options,
						);
					}
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
