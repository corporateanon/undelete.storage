'use strict';

module.exports = function getConfig() {
        var env = process.env;

        return {
                http: {
                        port: env['PORT'] || 3001,
                },
        };
};
