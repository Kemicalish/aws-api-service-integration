const githubResourceId = 'ohch2d';

import { githubMapVtl } from '../.private/github-map-vtl.js'; // githubMapVtl should be of the form 
/*
{
    "client_id" : "<YOUR_APP_CLIENT_ID>",
    "client_secret" :"<YOUR_APP_CLIENT_SECRET>",
    "code":$input.json('$.code')
}
*/

import { getApiResource, getResourceMethod, 
    putResourceMethod, putIntegrationRequestHttp, 
    putIntegrationResponse, putResourceMethodResponse } from './aws/gateway/resource';

export const createGithubPostMethod = resource => new Promise((resolve, reject) => {
    putResourceMethod({...resource, httpMethod: 'POST'})
        .then(resolve, reject);
});

export const getGithubResource = api => new Promise((resolve, reject) => {
    getApiResource({...api, resourceId: githubResourceId})
        .then(resolve, reject);
});

export const getGithubPostMethodErrorHandler = resource => error => new Promise((resolve, reject) => {
    if(error.code === 'NotFoundException') {
        createGithubPostMethod(resource)
            .then(resolve, reject);
        return;
    }
    reject(error);
});

export const getGithubPostMethod = resource => new Promise((resolve, reject) => {
    getResourceMethod({...resource, httpMethod: 'POST'})
        .catch(getGithubPostMethodErrorHandler(resource))
        .then(resolve, reject);
});

export const putGithubIntegrationRequest = resource => new Promise((resolve, reject) => {
    putIntegrationRequestHttp({...resource, httpMethod: 'POST', url: 'https://github.com/login/oauth/access_token', mapTemplates:{
        'application/json':githubMapVtl
    }})
    .then(response => {
        resolve({...resource, response});
    }, reject);
});

export const putGithubIntegrationResponse = resource => new Promise((resolve, reject) => {
    putIntegrationResponse({...resource, httpMethod: 'POST'})
    .then(response => {
        resolve({...resource, response});
    }, reject);
});

export const putGithubPostMethodResponse = resource => new Promise((resolve, reject) => {
    putResourceMethodResponse({...resource, httpMethod: 'POST'})
    .then(response => {
        resolve({...resource, response});
    }, reject);
});


