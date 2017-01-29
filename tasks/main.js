const gulp = require('gulp');
const apiId = 'hlx6uzy9w7';
const region = 'eu-west-1';


import { getApi, createDeployApi } from './aws/gateway/api';
import { getGithubResource, getGithubPostMethod, 
    putGithubIntegrationRequest, putGithubIntegrationResponse, 
    putGithubPostMethodResponse } from './github';

gulp.task('github', () => {
    //Get existing API
    getApi(apiId, region)
        .then(getGithubResource, console.error)
        .then(getGithubPostMethod, console.error)
        .then(putGithubIntegrationRequest, console.error)
        .then(putGithubIntegrationResponse, console.error)
        .then(putGithubPostMethodResponse, console.error)
        .then(createDeployApi({apiId, stageName: 'dev'}))
        .then(data => console.log('############# END\n', data), console.error);
});

