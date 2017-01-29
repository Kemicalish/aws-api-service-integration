'use strict';
const gulp = require('gulp');
const _ = require('lodash');
const gulpLoadPlugins = require('gulp-load-plugins');
const $ = gulpLoadPlugins();
const path = require('path');
const lambdaDynamoFunctionName = 'lambdaDynamo';
const awsRoot = path.join('.', 'aws');
const devDir = 'dev';
const exampleRole = 'arn:aws:iam::680228575004:role/lambda-gateway-execution-role'; //set up a role in aws console with AWSLambdaFullAccess  policiy
const exampleProfile = 'lambda-gateway-execution'; //get it with aws configure (check readme)
const region = 'eu-west-1';
const exampleApiName = 'exampleApi';
const apiId = 'hlx6uzy9w7'; // use gulp.task('aws-create-api') to get the id
const apiRootId = 'ezxu2kl541'; // use gulp.task('aws-api-get-resources') to get the id
const dbManagerId = 'ex5x5t'; // use gulp.task('aws-create-resource-dbmanager') to get the id
const lambdaDynamoId = 'arn:aws:lambda:eu-west-1:680228575004:function:lambdaDynamo'; //use gulp aws-create-lambda-dynamo to get this id

const createLambdaDynamo = {
    args: [
        'lambda',
        'create-function',
        '--region', region,
        '--function-name', lambdaDynamoFunctionName,
        '--zip-file', 'fileb://' + path.join(__dirname, '..', 'dev', lambdaDynamoFunctionName + '.zip'), 
        '--role', exampleRole, 
        '--handler', lambdaDynamoFunctionName + '.handler',
        '--runtime', 'nodejs4.3', 
        '--profile', exampleProfile
    ]
};

const callLambda = functionName => {return {
    args: [
        'lambda',
        'invoke',
        '--invocation-type', 'RequestResponse ', //Event (no output) or RequestResponse (message output)
        '--function-name', functionName,
        '--region', region, 
        '--payload', 'file://' + path.join(__dirname, '..', 'aws', 'read.json') , 
        '--profile', exampleProfile,
        path.join(__dirname, '..', 'dev', 'echo.output') 
    ]
}};

const createApiBase = {
    args: [
        'apigateway',
        'create-rest-api'
    ]
}

const createApiHelp = _.merge({}, createApiBase, { args:_.concat(createApiBase.args, 
    ['help']
)});
const createApiCall = apiName => _.merge({}, createApiBase, { 
    args:_.concat(createApiBase.args, 
        [
            '--name', apiName,
            '--region', region,
            '--profile', exampleProfile
        ]
)});

const apiCmd = cmd => { return {
    args:[
        'apigateway', 
        cmd,
        '--rest-api-id', apiId,
        '--profile', exampleProfile
    ]
}}

const apiGetResources = () =>  apiCmd('get-resources');

const apiCreateResource = (resourceName, parentResourceId) => { return {
    args:_.concat(
        apiCmd('create-resource').args,
        ['--path-part', resourceName],
        ['--parent-id', parentResourceId]
    )
}}

const apiCreateMethod = (resourceId, methodType, authorization) => { return {
    args:_.concat(
        apiCmd('put-method').args,
        ['--resource-id', resourceId],
        ['--http-method', methodType],
        ['--authorization-type', authorization]
    )
}}

const apiMethodLinkLambda = (resourceId, methodType) => { return  {
    args:_.concat(
        apiCmd('put-integration').args,
        ['--resource-id', resourceId],
        ['--http-method', methodType],
        ['--type', 'AWS'],
        ['--integration-http-method', methodType], //could be different from --http-method
        ['--uri', `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${lambdaDynamoId}/invocations`]
    )
}}

const apiMethodResponse = (resourceId, methodType) => { return  {
    args:_.concat(
        apiCmd('put-method-response').args,
        ['--resource-id', resourceId],
        ['--http-method', methodType],
        ['--status-code', 200],
        ['--response-models',  "{\"application/json\": \"Empty\"}"]
    )
}}

const apiMethodLinkLambdaResponse = (resourceId, methodType) => { return  {
    args:_.concat(
        apiCmd('put-integration-response').args,
        ['--resource-id', resourceId],
        ['--http-method', methodType],
        ['--status-code', 200],
        ['--response-templates',  "{\"application/json\": \"\"}"]
    )
}}




gulp.task('aws-zip-lambda-dynamo', () => {
    const lambdaDynamoFunctionPath = path.join(awsRoot, lambdaDynamoFunctionName + '.js');
    console.log(lambdaDynamoFunctionPath);
  return gulp.src(lambdaDynamoFunctionPath)
     .pipe($.zip(lambdaDynamoFunctionName + '.zip'))
    .pipe(gulp.dest('dev'));
});

gulp.task('aws-create-lambda-dynamo', ['aws-zip-lambda-dynamo'], () => {
     run('aws', createLambdaDynamo.args, console.log);
});

gulp.task('aws-dynamo-call', () => {
     run('aws', callLambda(lambdaDynamoFunctionName), console.log);
});

//Note: each call create a new api with same name
gulp.task('aws-create-api', () => {
     run('aws', createApiCall(exampleApiName).args, console.log);
});

gulp.task('aws-api-get-resources', () => {
    run('aws', apiGetResources().args, console.log);
});

gulp.task('aws-create-resource-dbmanager', () => {
    run('aws', apiCreateResource('dbManager', apiRootId).args, console.log);
});

gulp.task('aws-link-lambda-dynamo-to-dbmanager-post', () => {
    run('aws', apiCreateMethod(dbManagerId, 'POST', 'NONE').args, data => {
        run('aws', apiMethodLinkLambda(dbManagerId, 'POST').args, data2 => {
            console.log(data2);
            run('aws', apiMethodResponse(dbManagerId, 'POST').args, data3 => {
                console.log(data3);
                run('aws', apiMethodLinkLambdaResponse(dbManagerId, 'POST').args, console.log);
            });
        });
    });
});

gulp.task('aws-create-method-request', () => {
    run('aws', apiCreateMethod(dbManagerId, 'POST', 'NONE').args, console.log);
});

gulp.task('aws-create-method-integration-request', () => {
    run('aws', apiMethodLinkLambda(dbManagerId, 'POST').args, console.log);
});

gulp.task('aws-create-method-integration-response', () => {
    run('aws', apiMethodResponse(dbManagerId, 'POST').args, console.log);
});

gulp.task('aws-create-method-response', () => {
    run('aws', apiMethodLinkLambdaResponse(dbManagerId, 'POST').args, console.log);
});



