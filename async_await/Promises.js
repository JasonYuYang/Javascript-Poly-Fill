class MyPromise {
  // 构造方法
  constructor(executor) {
    // 初始化值
    this.initValue();
    // 初始化this指向
    this.initBind();
    // 执行传进来的函数
    try {
      // 执行传进来的函数
      executor(this.resolve, this.reject);
    } catch (err) {
      // 捕捉到错误直接执行reject
      this.reject(err);
    }
  }

  initBind() {
    // 初始化this
    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);
    this.onFulfilledCallbacks = []; // 保存成功回调
    this.onRejectedCallbacks = []; // 保存失败回调
  }

  initValue() {
    // 初始化值
    this.PromiseResult = null; // 终值
    this.PromiseState = 'pending'; // 状态
  }

  resolve(value) {
    // state是不可变的
    if (this.PromiseState !== 'pending') return;
    // 如果执行resolve，状态变为fulfilled
    this.PromiseState = 'fulfilled';
    // 终值为传进来的值
    this.PromiseResult = value;
    // 执行保存的成功回调

    while (this.onFulfilledCallbacks.length) {
      this.onFulfilledCallbacks.shift()(this.PromiseResult);
    }
  }

  reject(reason) {
    // state是不可变的
    if (this.PromiseState !== 'pending') return;
    // 如果执行reject，状态变为rejected
    this.PromiseState = 'rejected';
    // 终值为传进来的reason
    this.PromiseResult = reason;
    // 执行保存的失败回调

    while (this.onRejectedCallbacks.length) {
      this.onRejectedCallbacks.shift()(this.PromiseResult);
    }
  }
  then(onFulfilled, onRejected) {
    // 接收两个回调 onFulfilled, onRejected

    // 参数校验，确保一定是函数
    onFulfilled =
      typeof onFulfilled === 'function' ? onFulfilled : (val) => val;
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (reason) => {
            throw reason;
          };

    var thenPromise = new MyPromise((resolve, reject) => {
      const resolvePromise = (cb) => {
        queueMicrotask(() => {
          try {
            const x = cb(this.PromiseResult);
            if (x === thenPromise) {
              // 不能返回自身哦
              throw new Error('不能返回自身。。。');
            }
            if (x instanceof MyPromise) {
              // 如果返回值是Promise
              // 如果返回值是promise对象，返回值为成功，新promise就是成功
              // 如果返回值是promise对象，返回值为失败，新promise就是失败
              // 谁知道返回的promise是失败成功？只有then知道
              x.then(resolve, reject);
            } else {
              // 非Promise就直接成功
              resolve(x);
            }
          } catch (err) {
            // 处理报错
            reject(err);
          }
        });
      };
      if (this.PromiseState === 'fulfilled') {
        // 如果当前为成功状态，执行第一个回调
        resolvePromise(onFulfilled);
      } else if (this.PromiseState === 'rejected') {
        // 如果当前为失败状态，执行第二個回调
        resolvePromise(onRejected);
      } else if (this.PromiseState === 'pending') {
        // 如果状态为待定状态，暂时保存两个回调
        this.onFulfilledCallbacks.push(resolvePromise.bind(this, onFulfilled));
        this.onRejectedCallbacks.push(resolvePromise.bind(this, onRejected));
      }
    });

    // 返回这个包装的Promise
    return thenPromise;
  }

  catch(fn) {
    return this.then(null, fn);
  }
}
//resolve方法
MyPromise.resolve = function (val) {
  return new MyPromise((resolve, reject) => {
    resolve(val);
  });
};
//reject方法
MyPromise.reject = function (val) {
  return new MyPromise((resolve, reject) => {
    reject(val);
  });
};
//all方法
// 接收一个Promise数组，数组中如有非Promise项，则此项当做成功
// 如果所有Promise都成功，则返回成功结果数组
// 如果有一个Promise失败，则返回这个失败结果
MyPromise.all = function (promises) {
  const result = [];
  let count = 0;
  return new MyPromise((resolve, reject) => {
    const addData = (index, value) => {
      result[index] = value;
      count++;
      if (count === promises.length) resolve(result);
    };
    promises.forEach((promise, index) => {
      if (promise instanceof MyPromise) {
        promise.then(
          (res) => {
            addData(index, res);
          },
          (err) => reject(err)
        );
      } else {
        addData(index, promise);
      }
    });
  });
};

// race方法
// 接收一个Promise数组，数组中如有非Promise项，则此项当做成功
// 哪个Promise最快得到结果，就返回那个结果，无论成功失败

MyPromise.race = function (promises) {
  return new MyPromise((resolve, reject) => {
    promises.forEach((promise) => {
      if (promise instanceof MyPromise) {
        promise.then(
          (res) => {
            resolve(res);
          },
          (err) => {
            reject(err);
          }
        );
      } else {
        resolve(promise);
      }
    });
  });
};

// allSettled方法
// 接收一个Promise数组，数组中如有非Promise项，则此项当做成功
// 把每一个Promise的结果，集合成数组，返回
MyPromise.allSettled = function (promises) {
  return new MyPromise((resolve, reject) => {
    const res = [];
    let count = 0;
    const addData = (status, value, i) => {
      res[i] = {
        status,
        value,
      };
      count++;
      if (count === promises.length) {
        resolve(res);
      }
    };
    promises.forEach((promise, i) => {
      if (promise instanceof MyPromise) {
        promise.then(
          (res) => {
            addData('fulfilled', res, i);
          },
          (err) => {
            addData('rejected', err, i);
          }
        );
      } else {
        addData('fulfilled', promise, i);
      }
    });
  });
};
// any方法
// any与all相反

// 接收一个Promise数组，数组中如有非Promise项，则此项当做成功
// 如果有一个Promise成功，则返回这个成功结果
// 如果所有Promise都失败，则报错
MyPromise.any = function (promises) {
  return new MyPromise((resolve, reject) => {
    let count = 0;
    promises.forEach((promise) => {
      promise.then(
        (val) => {
          resolve(val);
        },
        (err) => {
          count++;
          if (count === promises.length) {
            reject(new AggregateError('All promises were rejected'));
          }
        }
      );
    });
  });
};

const test3 = new MyPromise((resolve, reject) => {
  resolve(100); // 输出 状态：成功 值： 200
  // reject(100) // 输出 状态：失败 值：300
})
  .then(
    (res) => 2 * res,
    (err) => 3 * err
  )
  .then(
    (res) => console.log(res),
    (err) => console.log(err)
  );

const test4 = new MyPromise((resolve, reject) => {
  resolve(100); // 输出 状态：失败 值：200
  // reject(100) // 输出 状态：成功 值：300
  // 这里可没搞反哦。真的搞懂了，就知道了为啥这里是反的
})
  .then(
    (res) => new MyPromise((resolve, reject) => reject(2 * res)),
    (err) => new MyPromise((resolve, reject) => resolve(2 * res))
  )
  .then(
    (res) => console.log(res),
    (err) => console.log(err)
  );

//   看了就会，手写Promise原理，最通俗易懂的版本！！！
//https://juejin.cn/post/6994594642280857630#heading-11
//
//   手写一个Promise/A+,完美通过官方872个测试用例
// https://juejin.cn/post/6844904116913700877#heading-21
//
//100 行代码实现 Promises/A+ 规范
//https://mp.weixin.qq.com/s/qdJ0Xd8zTgtetFdlJL3P1g
//
//剖析Promise内部结构，一步一步实现一个完整的、能通过所有Test case的Promise类
//https://github.com/xieranmaya/blog/issues/3#

// v是一个实例化的promise，且状态为fulfilled
let v = new Promise((resolve) => {
  console.log('begin');
  resolve('then');
});

// 在promise里面resolve一个状态为fulfilled的promise

// 模式一 new Promise里的resolve()
// begin->1->2->3->then->4 可以发现then推迟了两个时序
// 推迟原因：浏览器会创建一个 PromiseResolveThenableJob 去处理这个 Promise 实例，这是一个微任务。
// 等到下次循环到来这个微任务会执行，也就是PromiseResolveThenableJob 执行中的时候，因为这个Promise 实例是fulfilled状态，所以又会注册一个它的.then()回调
// 又等一次循环到这个Promise 实例它的.then()回调执行后，才会注册下面的这个.then(),于是就被推迟了两个时序
new Promise((resolve) => {
  resolve(v);
}).then((v) => {
  console.log(v);
});

//  模式二 Promise.resolve(v)直接创建
// begin->1->then->2->3->4 可以发现then的执行时间正常了，第一个执行的微任务就是下面这个.then
// 原因：Promise.resolve()API如果参数是promise会直接返回这个promise实例，不会做任何处理
/*     Promise.resolve(v).then((v)=>{
      console.log(v)
  }); */

new Promise((resolve) => {
  console.log(1);
  resolve();
})
  .then(() => {
    console.log(2);
  })
  .then(() => {
    console.log(3);
  })
  .then(() => {
    console.log(4);
  });
//Promise.resolve()与new Promise(r => r(v))
//https://segmentfault.com/a/1190000020980101
//令人费解的 async/await 执行顺序
//https://juejin.cn/post/6844903762478235656
