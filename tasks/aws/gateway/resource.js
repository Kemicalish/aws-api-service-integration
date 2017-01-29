import {aws} from '../aws';

export const createApiResource = ({api, parentId, resourceName}) => new Promise((resolve, reject) => {
    aws([
        'apigateway',
        'create-resource',
        '--rest-api-id', api.id,
        '--parent-id', parentId,
        '--path-part', resourceName
    ])
    .then(resource => {
        resolve({api, resourceName, parentId, resourceId: resource.id, ...resource});
    }, reject);
});

export const getApiResource = ({api, resourceId}) => new Promise((resolve, reject) => {
    aws([
        'apigateway',
        'get-resource',
        '--rest-api-id', api.id,
        '--resource-id', resourceId
    ])
    .then(resource => {
        resolve({api, resourceId, ...resource});
    }, reject);
});

export const putResourceMethod = ({api, resourceId, httpMethod}) => new Promise((resolve, reject) => {
    aws([
        'apigateway',
        'put-method',
        '--rest-api-id', api.id,
        '--resource-id', resourceId,
        '--http-method', httpMethod,
        '--authorization-type', 'NONE'
    ])
    .then(() => resolve({api, resourceId, httpMethod}), reject);
});

export const getResourceMethod = ({api, resourceId, httpMethod}) => new Promise((resolve, reject) => {
    aws([
        'apigateway',
        'get-method',
        '--rest-api-id', api.id,
        '--resource-id', resourceId,
        '--http-method', httpMethod
    ])
    .then(() => resolve({api, resourceId, httpMethod}), reject);
});

export const putIntegrationRequestHttp = ({api, resourceId, httpMethod, url, mapTemplates = {} }) => new Promise((resolve, reject) => {
    aws([
        'apigateway',
        'put-integration',
        '--rest-api-id', api.id,
        '--resource-id', resourceId,
        '--http-method', httpMethod,
        '--type', 'HTTP',
        '--integration-http-method', httpMethod, //could be different from request http method itself
        '--uri', url,
        //'--request-parameters', {},
        '--request-templates', JSON.stringify(mapTemplates),
        '--passthrough-behavior', 'WHEN_NO_TEMPLATES'
    ])
    .then(resolve, reject);
});

export const putIntegrationResponse = ({api, resourceId, httpMethod}) => new Promise((resolve, reject) => {
    aws([
        'apigateway',
        'put-integration-response',
        '--rest-api-id', api.id,
        '--resource-id', resourceId,
        '--http-method', httpMethod,
        '--status-code', 200,
        '--response-templates', '{"application/json": "$input.json(\'$\')"}',
        '--region', api.region
    ])
    .then(resolve, reject);
});

export const putResourceMethodResponse = ({api, resourceId, httpMethod}) => new Promise((resolve, reject) => {
    aws([
        'apigateway',
        'put-method-response',
        '--rest-api-id', api.id,
        '--resource-id', resourceId,
        '--http-method', httpMethod,
        '--status-code', 200,
        '--region', api.region
    ])
    .then(resolve, reject);
});
