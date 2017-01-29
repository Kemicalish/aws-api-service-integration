export function run(cmd, args, callback) {
    console.log(args);
    console.log('RUN', cmd, args.join(' '));
    const spawn = require('child_process').spawn;
    const command = spawn(cmd, args);
    let result = '';
    command.stdout.on('data', function(data) {
        console.log();
         result += data.toString();
    });
    command.stderr.on('data', function(data) {
        console.error(data.toString('utf-8'));
    });
    command.on('close', function(code) {
        return callback(result);
    });
}