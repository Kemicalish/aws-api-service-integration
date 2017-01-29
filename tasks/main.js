const gulp = require('gulp');
const _ = require('lodash');

const apiId = 'hlx6uzy9w7';
const githubResourceId = 'ohch2d';
const region = 'eu-west-1';
const exampleMapVtl = `
{
    "name" : "$input.params('name')",
    "body" : $input.json('$') 
}
`;

import { getApi } from './aws/gateway/api';
import { getApiResource, getResourceMethod, putResourceMethod, putIntegrationRequestHttp } from './aws/gateway/resource';

const createGithubPostMethod = resource => new Promise((resolve, reject) => {
    putResourceMethod({...resource, httpMethod: 'POST'})
        .then(resolve, reject);
});

const getGithubResource = api => new Promise((resolve, reject) => {
    getApiResource({...api, resourceId: githubResourceId})
        .then(resolve, reject);
});

const getGithubPostMethodErrorHandler = resource => error => new Promise((resolve, reject) => {
    if(error.code === 'NotFoundException') {
        createGithubPostMethod(resource)
            .then(resolve, reject);
        return;
    }
    reject(error);
});

const getGithubPostMethod = resource => new Promise((resolve, reject) => {
    getResourceMethod({...resource, httpMethod: 'POST'})
        .catch(getGithubPostMethodErrorHandler(resource))
        .then(resolve, reject);
});

const putGithubIntegrationRequest = resource => new Promise((resolve, reject) => {
    putIntegrationRequestHttp({...resource, httpMethod: 'POST', url: 'https://github.com/login/oauth/access_token', mapTemplates:{
        'application/json':exampleMapVtl
    }})
    .then(resolve, reject);
});

gulp.task('github', () => {
    //Get existing API
    getApi(apiId, region)
        .then(getGithubResource, console.error)
        .then(getGithubPostMethod, console.error)
        .then(putGithubIntegrationRequest, console.error)
        .then(data => console.log('############# END\n', data), console.error);
});

