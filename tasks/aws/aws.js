const errRegex = /\(([^\)]*)\)/g;

const getErrCode = errMessage => {
    const match = errRegex.exec(errMessage);
    try{
        return match[1];
    } catch(e) {
        return 'UNKNOWN_CODE';
    }
};


export const aws = options => new Promise((resolve, reject) => {
    const spawn = require('child_process').spawn;
    const command = spawn('aws', options);
    console.log(['aws', ...options].join(' '));

    command.stdout.on('data', function (data) {
        resolve(JSON.parse(data.toString('utf-8')));
    });
    command.stderr.on('data', function (data) {
        const errMessage = data.toString('utf-8');
        const errorCode = getErrCode(errMessage);
        reject({code: errorCode, message: errMessage, options});
    });
});
