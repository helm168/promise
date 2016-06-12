const Promise = require('../promise');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 2000;

describe('Promise/A+ implement test', () => {
    const value = 'helm';
    const reason = new Error('nothing');

    var p;

    beforeEach(() => {
        p = () => {
            return new Promise((resolve, reject) => resolve(value));
        };
    });

    it('should resolve with value "' + value + '"', done => {
        p().then(val => {
            expect(val).toBe(value);
            done();
        });

    });

    it('should be resolved only once', done => {
        p = p();

        var count = 0;

        p.then(val => count++);

        setTimeout(() => {
            p.then(val => count++);
        }, 100);

        setTimeout(() => {
            expect(count).toBe(2);
            done();
        }, 200);

    });

    it('should be resolved async', done => {
        var x = 0;
        p().then(() => {
            expect(x).toBe(5);
            done();
        });
        x = 5;
    });

    it('should reject with reason "' + reason.message + '" in onReject function', done => {
        p = () => {
            return new Promise((resolve, reject) => {
                reject(reason);
            });
        };

        p().then(null, err => {
            expect(err).toBe(reason);
            done();
        });
    });

    it('should return a promise when call then method', done => {
        p = p();

        var f = p.then(val => {
            done();
            return value;
        });
        expect(f).not.toBe(undefined);
        expect(typeof f.then).toBe('function');
    });

    it('should chain with then onResolve', done => {
        p = p();

        p.then(val => {
            return value;
        }).then(val => {
            expect(val).toBe(value);
            return Promise.resolve(value);
        }).then(val => {
            expect(val).toBe(value);
            return Promise.resolve(Promise.resolve(value));
        }).then(val => {
            expect(val).toBe(value);
            done();
        });
    });

    it('should chain with then onReject', done => {
        p = () => {
            return new Promise((resolve, reject) => {
                reject(reason);
            });
        };
        p = p();

        p.then(null, val => {
            return value;
        }).then(val => {
            expect(val).toBe(value);
            done();
        });
    });

    it('should chain with then onReject', done => {
        p = () => {
            return new Promise((resolve, reject) => {
                reject(reason);
            });
        };
        p = p();

        p.then(null, val => {
            return value;
        }).then(val => {
            expect(val).toBe(value);
            done();
        });
    });

    it('should chain with reject when onResolve throw exception', done => {
        p = p();

        p.then(val => {
            throw reason;
        }).then(null, err => {
            expect(err).toBe(reason);
            done();
        });
    });

    it('should chain with reject when onReject throw exception', done => {
        p = () => {
            return new Promise((resolve, reject) => {
                reject(reason);
            });
        };
        p = p();

        p.then(null, err => {
            throw reason;
        }).then(null, err => {
            expect(err).toBe(reason);
            done();
        });
    });

    it('should chain with same value when onResolve is not a function', done => {
        p = p();

        p.then().then(val => {
            expect(val).toBe(value);
            done();
        });
    });

    it('should chain with same reason when onReject is not a function', done => {
        p = () => {
            return new Promise((resolve, reject) => {
                reject(reason);
            });
        };
        p = p();

        p.then().then(null, err => {
            expect(err).toBe(reason);
            done();
        });
    });
});
