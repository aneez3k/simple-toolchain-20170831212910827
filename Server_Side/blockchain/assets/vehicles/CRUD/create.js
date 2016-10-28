'use strict';
let tracing = require(__dirname+'/../../../../tools/traces/trace.js');
let map_ID = require(__dirname+'/../../../../tools/map_ID/map_ID.js');
let Util = require(__dirname+'/../../../../tools/utils/util');

function create (req, res, next, usersToSecurityContext) {
    let user_id;
    let securityContext;
    // tracing.create('ENTER', 'POST blockchain/assets/vehicles', req.body);

    if(typeof req.cookies.user !== 'undefined')
    {
        req.session.user = req.cookies.user;
        req.session.identity = req.cookies.user;
    }
    user_id = map_ID.user_to_id(req.session.identity);

    securityContext = usersToSecurityContext[user_id];

    let newV5cID = createV5cID();

    return checkIfAlreadyExists(securityContext, newV5cID)
        .then(function() {
            // res.write(JSON.stringify({message:'Creating vehicle with v5cID: '+newV5cID})+'&&');
            // tracing.create('INFO', 'POST blockchain/assets/vehicles', 'Creating vehicle with v5cID: '+newV5cID);
            // return createVehicle(securityContext, newV5cID);
        })
        .then(function() {
            // tracing.create('INFO', 'POST blockchain/assets/vehicles', 'Creted vehicle: '+newV5cID);
            let result = {};
            result.message = 'Creation Confirmed';
            result.v5cID = newV5cID;
            res.send(JSON.stringify(result));
        })
        .catch(function(err) {
            // tracing.create('ERROR', 'POST blockchain/assets/vehicles', err.stack);
            res.send(JSON.stringify({'message':err.stack}));
        });
}

exports.create = create;

// TODO: Covert this to use the Util function
function checkIfAlreadyExists(securityContext, v5cID) {
    return Util.queryChaincode(securityContext, 'check_unique_v5c', [ v5cID ]);
}

function createVehicle(securityContext, v5cID) {
    return Util.invokeChaincode(securityContext, 'create_vehicle', [ v5cID ]);
}

function createV5cID() {
    let numbers = '1234567890';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let v5cID = '';
    for(let i = 0; i < 7; i++)
        {
        v5cID += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    v5cID = characters.charAt(Math.floor(Math.random() * characters.length)) + v5cID;
    v5cID = characters.charAt(Math.floor(Math.random() * characters.length)) + v5cID;
    return v5cID;
}
