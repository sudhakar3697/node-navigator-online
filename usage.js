const nwEvents = require('./index');

nwEvents.on('online', () => {
    console.log('Currently online');
})

nwEvents.on('offline', () => {
    console.log('Currently online');
})

nwEvents.on('close', () => {
    clearTimeout(poll);
    console.log('Closed');
})

const poll = setTimeout(() => {
    nwEvents.stopListening();
}, 10000);
