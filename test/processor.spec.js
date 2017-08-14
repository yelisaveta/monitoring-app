const proxyquire = require('proxyquire');

describe('processor', () => {

    let requestSpy;
    let healthchecksData;
    let processor;

    beforeEach(() => {
        requestSpy = jasmine.createSpy('request').and.callFake((options, callback) => {
            callback(null, { statusCode: 200 });
        });

        healthchecksData = [{
            url: 'http://example.com',
            method: 'GET'
        }, {
                url: 'http://anotherexample.com',
                method: 'POST'
            }
        ];

        processor = proxyquire('../processor', {
            './data.json': healthchecksData,
            'request': requestSpy
        });
    });

    describe('start()', () => {

        it('should be defined', () => {
            expect(processor.start).toBeDefined();
        });

        it('should make HTTP request for every healthcheck', done => {
            processor.start()
                .then(() => {
                    expect(requestSpy.calls.count()).toEqual(2);
                    done();
                });
        });

        it('should make HTTP request to url and method specified in healthcheck', done => {
            const verifyRequestSpyArgumentsForCall = callNumber => {
                expect(requestSpy.calls.argsFor(callNumber)).toEqual([{
                    url: healthchecksData[callNumber].url,
                    method: healthchecksData[callNumber].method
                }, jasmine.any(Function)]);
            };

            processor.start()
                .then(() => {
                    verifyRequestSpyArgumentsForCall(0);
                    verifyRequestSpyArgumentsForCall(1);

                    done();
                });
        });

        describe('result', () => {

            const verifyResult = (result, callNumber, expectedResponse) => {
                expect(result[callNumber]).toEqual({
                    request: {
                        url: healthchecksData[callNumber].url,
                        method: healthchecksData[callNumber].method
                    },
                    response: expectedResponse
                });
            };

            it('should be defined for every healthcheck', done => {
                processor.start()
                    .then(result => {
                        expect(result).toBeDefined();
                        expect(result.length).toEqual(2);

                        done();
                    });
            });

            it('should contain request and response on success / error', done => {
                const err = new Error('Unable to ping URL');

                let callNumber = 0;
                requestSpy.and.callFake((options, callback) => {
                    if (callNumber === 0) {
                        callNumber += 1;
                        callback(null, { statusCode: 200 });
                    } else {
                        callback(err);
                    }
                });

                processor.start()
                    .then(result => {

                        const expectedSuccessResponse = {
                            error: null,
                            statusCode: 200
                        };

                        const expectedErrorResponse = {
                            error: err
                        };

                        verifyResult(result, 0, expectedSuccessResponse);
                        verifyResult(result, 1, expectedErrorResponse);

                        done();
                    });
            });

        });

    });

});