const STATE = {
    pending: 0,
    fulfilled: 1,
    rejected: 2,
};

/**
 * a promise/A+ implement
 * ref https://promisesaplus.com/
 */

function Promise(cb) {
    var resolve = val => {
        if (this.state === STATE.pending) {
            this.state = STATE.fulfilled;
            this.value = val;
            this.doResolve();
        }
    };

    var reject = reason => {
        if (this.state === STATE.pending) {
            this.state = STATE.rejected;
            this.reason = reason;
            this.doReject();
        }
    };

    this.thenable = [];
    this.state = STATE.pending;

    cb(resolve, reject);
}

Promise.resolve = function(val) {
    return new Promise(resolve => resolve(val));
};

Promise.prototype.then = function(onResolve, onReject) {
    var p, resolve, reject;
    setTimeout(() => {
        this.thenable.push(onResolve, onReject, p, resolve, reject);
        this.doResolve();
        this.doReject();
    });
    p = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return p;
};

Promise.prototype.doResolve = function() {
    if (this.state === STATE.fulfilled) {
        var idx, ln, resolve, newPromise, nextResolve, nextReject;
        ln = this.thenable.length;
        for(idx = 0; idx < ln; idx=idx+5) {
            resolve = this.thenable[idx];
            newPromise = this.thenable[idx + 2];
            nextResolve = this.thenable[idx + 3];
            nextReject = this.thenable[idx + 4];
            if (typeof resolve === 'function') {
                try {
                    var res = resolve(this.value);
                    this.chainResolve(newPromise, nextResolve, nextReject, res);
                } catch(e) {
                    this.chainReject(newPromise, nextResolve, nextReject, e);
                }
            } else {
                this.chainResolve(newPromise, nextResolve, nextReject, this.value);
            }
        }
        this.thenable = [];
    }
};

Promise.prototype.doReject = function() {
    if (this.state === STATE.rejected) {
        var idx, ln, reject, newPromise, nextResolve, nextReject;
        ln = this.thenable.length;
        for(idx = 0; idx < ln; idx=idx+5) {
            reject = this.thenable[idx+1];
            newPromise = this.thenable[idx + 2];
            nextResolve = this.thenable[idx + 3];
            nextReject = this.thenable[idx + 4];
            if (typeof reject === 'function') {
                try {
                    var res = reject(this.reason);
                    this.chainResolve(newPromise, nextResolve, nextReject, res);
                } catch(e) {
                    this.chainReject(newPromise, nextResolve, nextReject, e);
                }
            } else {
                this.chainReject(newPromise, nextResolve, nextReject, this.reason);
            }
        }
        this.thenable = [];
    }
};

Promise.prototype.chainResolve = function(promise, resolve, reject, res) {
    if (promise === res) {
        reject(new TypeError('Chaining cycle detected for promise'));
    } else if (res && res.then) {
        var called = false;
        try {
            res.then(val => {
                called = true;
                this.chainResolve(promise, resolve, reject, val);
            }, reason => {
                called = true;
                reject(reason);
            });
        } catch(e)  {
            if (!called) {
                reject(e);
            }
        }
    } else {
        resolve(res);
    }
};

Promise.prototype.chainReject = function(promise, resolve, reject, reason) {
    reject(reason);
};

module.exports = Promise;
