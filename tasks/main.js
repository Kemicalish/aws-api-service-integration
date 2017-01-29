const gulp = require('gulp');
const apiId = 'hlx6uzy9w7';
const region = 'eu-west-1';
const parentId = '0gotr8';

import {createOauthAccess} from './aws-integrate';

gulp.task('integrate', () => {
    [{
        serviceName: 'github',
        serviceOauthAccessTokenUrl: 'https://github.com/login/oauth/access_token',
        serviceMapVtl: `
        {
            "client_id" : "<YOUR_APP_CLIENT_ID>",
            "client_secret" : "<YOUR_APP_CLIENT_SECRET>",
            "code":$input.json('$.code')
        }
        `
    },
    {
        serviceName: 'bitbucket',
        serviceOauthAccessTokenUrl: 'https://bitbucket.org/site/oauth2/access_token',
        serviceMapVtl: `
        {
            "client_id" : "<YOUR_APP_CLIENT_ID>",
            "client_secret" : "<YOUR_APP_CLIENT_SECRET>",
            "code":$input.json('$.code'),
            "grant_type":"authorization_code"
        }
        `
    }
    ].forEach(newService => {
        createOauthAccess({apiId, region, parentId, ...newService});
    });
})


//Then you can test them with: 
//https://github.com/login/oauth/authorize?client_id={YOUR_APP_CLIENT_ID}&scope=repo
//or
//https://bitbucket.org/site/oauth2/authorize?client_id={YOUR_APP_CLIENT_ID}&response_type=code&scope=repo
//and post back the code you receive to your new endpoint without compromising your credentials on the client side
//Right now, as long as a service is supporting application/json authorization code (or web server) flow, you should be fine 