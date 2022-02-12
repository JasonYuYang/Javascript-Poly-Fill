class MyPromise {
  constructor(executor) {
    this.value = null;
    this.state = 'PENDING';
    // 初始化this
    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);
    this.onFulfilledCallbacks = []; // 保存成功回调
    this.onRejectedCallbacks = []; // 保存失败回调
    try {
      executor(resolve, reject);
    } catch (err) {
      this.reject(err);
    }
  }
  resolve(value) {
    if (this.state !== 'PENDING') return;
    this.state = 'RESOLVED';
    this.value = value;
    while (this.onFulfilledCallbacks.length) {
      this.onFulfilledCallbacks.shift()(this.value);
    }
  }
  reject(err) {
    if (this.state !== 'PENDING') return;
    this.state = 'REJECTED';
    this.value = err;
    while (this.onRejectedCallbacks.length) {
      this.onRejectedCallbacks.shift()(err);
    }
  }
  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : val => val;
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : err => {
            throw err;
          };

    return new MyPromise((resolve, reject) => {
      const resolvePromise = cb => {
        queueMicrotask(() => {
          try {
            const x = cb(this.value);
            if (x instanceof MyPromise) {
              x.then(resolve, reject);
            } else {
              resolve(x);
            }
          } catch (err) {
            reject(err);
            throw new Error(err);
          }
        });
        if (this.PromiseState === 'fulfilled') {
          resolvePromise(onFulfilled);
        } else if (this.PromiseState === 'rejected') {
          resolvePromise(onRejected);
        } else if (this.PromiseState === 'pending') {
          this.onFulfilledCallbacks.push(resolvePromise.bind(this, onFulfilled));
          this.onRejectedCallbacks.push(resolvePromise.bind(this, onRejected));
        }
      };
    });
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
///////測試MyPromise/////////
// const test3 = new MyPromise((resolve, reject) => {
//   resolve(100); // 输出 状态：成功 值： 200
//   // reject(100) // 输出 状态：失败 值：300
// })
//   .then(
//     res => 2 * res,
//     err => 3 * err
//   )
//   .then(
//     res => console.log(res),
//     err => console.log(err)
//   );

// const test4 = new MyPromise((resolve, reject) => {
//   resolve(100); // 输出 状态：失败 值：200
//   // reject(100) // 输出 状态：成功 值：300
//   // 这里可没搞反哦。真的搞懂了，就知道了为啥这里是反的
// })
//   .then(
//     res => new MyPromise((resolve, reject) => reject(2 * res)),
//     err => new MyPromise((resolve, reject) => resolve(2 * res))
//   )
//   .then(
//     res => console.log(res),
//     err => console.log(err)
//   );
//////////////////////////

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
          res => {
            addData(index, res);
          },
          err => reject(err)
        );
      } else {
        addData(index, promise);
      }
    });
  });
};
///////////////all方法測試////////////////
// const p1 = MyPromise.resolve(1)
// const p2 = new MyPromise((resolve) => {
//   setTimeout(() => resolve(2), 1000)
// })
// const p3 = new MyPromise((resolve) => {
//   setTimeout(() => resolve(3), 3000)
// })

// const p4 = MyPromise.reject('err4')
// const p5 = MyPromise.reject('err5')
// // 1. 所有的Promise都成功了
// const p11 = MyPromise.all([ p1, p2, p3 ])
// 	.then(console.log) // [ 1, 2, 3 ]
//       .catch(console.log)

// // 2. 有一个Promise失败了
// const p12 = MyPromise.all([ p1, p2, p4 ])
// 	.then(console.log)
//       .catch(console.log) // err4

// // 3. 有两个Promise失败了，可以看到最终输出的是err4，第一个失败的返回值
// const p13 = MyPromise.all([ p1, p4, p5 ])
// 	.then(console.log)
//       .catch(console.log) // err4
// // 与原生的Promise.all返回是一致的

/////////////////////////////////////////

// race方法
// 接收一个Promise数组，数组中如有非Promise项，则此项当做成功
// 哪个Promise最快得到结果，就返回那个结果，无论成功失败

MyPromise.race = function (promises) {
  return new MyPromise((resolve, reject) => {
    promises.forEach(promise => {
      if (promise instanceof MyPromise) {
        promise.then(
          res => {
            resolve(res);
          },
          err => {
            reject(err);
          }
        );
      } else {
        resolve(promise);
      }
    });
  });
};
/////////////////////race方法測試/////////////
// // 测试一下
// const p1 = new MyPromise((resolve, reject) => {
//   setTimeout(resolve, 500, 1)
// })

// const p2 = new MyPromise((resolve, reject) => {
//   setTimeout(resolve, 100, 2)
// })

// MyPromise.race([p1, p2]).then((value) => {
//   console.log(value) // 2
// })

// MyPromise.race([p1, p2, 3]).then((value) => {
//   console.log(value) // 3
// })

/////////////////////////////////////////////

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
          res => {
            addData('fulfilled', res, i);
          },
          err => {
            addData('rejected', err, i);
          }
        );
      } else {
        addData('fulfilled', promise, i);
      }
    });
  });
};
///////////////////////////////allSettled測試//////////////////////////
// // 测试一下
// const p1 = Promise.resolve(1)
// const p2 = new Promise((resolve) => {
//   setTimeout(() => resolve(2), 1000)
// })
// const p3 = new Promise((resolve) => {
//   setTimeout(() => resolve(3), 3000)
// })

// const p4 = Promise.reject('err4')
// const p5 = Promise.reject('err5')
// // 1. 所有的Promise都成功了
// const p11 = Promise.myAllSettled([ p1, p2, p3 ])
// 	.then((res) => console.log(JSON.stringify(res, null,  2)))

// // 输出
// /*
// [
//   {
//     "status": "fulfilled",
//     "value": 1
//   },
//   {
//     "status": "fulfilled",
//     "value": 2
//   },
//   {
//     "status": "fulfilled",
//     "value": 3
//   }
// ]
// */

// // 2. 有一个Promise失败了
// const p12 = Promise.myAllSettled([ p1, p2, p4 ])
// 	.then((res) => console.log(JSON.stringify(res, null,  2)))

// // 输出
// /*
// [
//   {
//     "status": "fulfilled",
//     "value": 1
//   },
//   {
//     "status": "fulfilled",
//     "value": 2
//   },
//   {
//     "status": "rejected",
//     "reason": "err4"
//   }
// ]
// */

// // 3. 有两个Promise失败了
// const p13 = Promise.myAllSettled([ p1, p4, p5 ])
// 	.then((res) => console.log(JSON.stringify(res, null,  2)))

// // 输出
// /*
// [
//   {
//     "status": "fulfilled",
//     "value": 1
//   },
//   {
//     "status": "rejected",
//     "reason": "err4"
//   },
//   {
//     "status": "rejected",
//     "reason": "err5"
//   }
// ]
// */

//////////////////////////////////////////////////////////////////////

// any方法
// any与all相反

// 接收一个Promise数组，数组中如有非Promise项，则此项当做成功
// 如果有一个Promise成功，则返回这个成功结果
// 如果所有Promise都失败，则报错
MyPromise.any = function (promises) {
  return new MyPromise((resolve, reject) => {
    let count = 0;
    promises.forEach(promise => {
      promise.then(
        val => {
          resolve(val);
        },
        err => {
          count++;
          if (count === promises.length) {
            reject(new AggregateError('All promises were rejected'));
          }
        }
      );
    });
  });
};
/////////////all方法測試//////////////////
// 测试一下
// const p1 = Promise.resolve(1)
// const p2 = new Promise((resolve) => {
//   setTimeout(() => resolve(2), 1000)
// })
// const p3 = new Promise((resolve) => {
//   setTimeout(() => resolve(3), 3000)
// })

// const p4 = Promise.reject('err4')
// const p5 = Promise.reject('err5')
// // 1. 所有的Promise都成功了
// const p11 = Promise.myAll([ p1, p2, p3 ])
// 	.then(console.log) // [ 1, 2, 3 ]
//       .catch(console.log)

// // 2. 有一个Promise失败了
// const p12 = Promise.myAll([ p1, p2, p4 ])
// 	.then(console.log)
//       .catch(console.log) // err4

// // 3. 有两个Promise失败了，可以看到最终输出的是err4，第一个失败的返回值
// const p13 = Promise.myAll([ p1, p4, p5 ])
// 	.then(console.log)
//       .catch(console.log) // err4
// // 与原生的Promise.all返回是一致的

/////////////////////////////////////////
