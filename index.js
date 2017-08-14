const processor = require('./processor');

processor.start()
    .then(result => {
        console.log('processed all items, result:', result);

        result.forEach(item => {
            if (item.response.error) {
                console.warn(`got error on request ${item.request.method}: ${item.request.url}`, item.response.error);
            } else {
                if (item.response.statusCode !== 200) {
                    console.warn(`got ${item.response.statusCode} HTTP code on request ${item.request.method}: ${item.request.url}`);
                } else {
                    console.info(`successfully pinged ${item.request.method}: ${item.request.url}, got ${item.response.statusCode} HTTP code`)
                }
            }
        })
    }, err => {
        console.log(`Error occurred: ${err}`);
    });




