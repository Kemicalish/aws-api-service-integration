import { aws } from '../aws';

export const getApi = (apiId, region) => new Promise((resolve, reject) => aws([
    'apigateway',
    'get-rest-api',
    '--rest-api-id', apiId,
    '--region', region
])
    .then(api => {
        resolve({api: {...api, region}});
    }, reject)
);
