
import { createApiResource, putResourceMethod, putIntegrationRequestHttp, 
    putIntegrationResponse, putResourceMethodResponse } from './aws/gateway/resource';


export const createApiServiceResource = (parentId, resourceName) => api => new Promise((resolve, reject) => {
    createApiResource({...api, parentId, resourceName})
        .then(newApi => {
            console.log(newApi); 
            resolve(newApi);
        }, reject);
});

export const createServicePostMethod = resource => new Promise((resolve, reject) => {
    putResourceMethod({...resource, httpMethod: 'POST'})
        .then(resolve, reject);
});

export const putServiceIntegrationRequest = (serviceOauthAccessTokenUrl, serviceMapVtl) => resource => new Promise((resolve, reject) => {
    putIntegrationRequestHttp({...resource, httpMethod: 'POST', url: serviceOauthAccessTokenUrl, mapTemplates:{
        'application/json':serviceMapVtl
    }})
    .then(response => {
        resolve({...resource, response});
    }, reject);
});

export const putServiceIntegrationResponse = resource => new Promise((resolve, reject) => {
    putIntegrationResponse({...resource, httpMethod: 'POST'})
    .then(response => {
        resolve({...resource, response});
    }, reject);
});

export const putServicePostMethodResponse = resource => new Promise((resolve, reject) => {
    putResourceMethodResponse({...resource, httpMethod: 'POST'})
    .then(response => {
        resolve({...resource, response});
    }, reject);
});

import { getApi, createDeployApi } from './aws/gateway/api';
export const createOauthAccess = ({apiId, region, parentId, serviceName, serviceOauthAccessTokenUrl, serviceMapVtl}) => {
    getApi(apiId, region)
        .then(createApiServiceResource(parentId, serviceName), console.error)
        .then(createServicePostMethod, console.error)
        .then(putServiceIntegrationRequest(serviceOauthAccessTokenUrl, serviceMapVtl), console.error)
        .then(putServiceIntegrationResponse, console.error)
        .then(putServicePostMethodResponse, console.error)
        .then(createDeployApi({apiId, stageName: 'dev'}))
        .then(data => console.log('############# END\n', data), console.error);
}
