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
    queueMicrotask(() => {
      while (this.onFulfilledCallbacks.length) {
        this.onFulfilledCallbacks.shift()(this.PromiseResult);
      }
    });
  }

  reject(reason) {
    // state是不可变的
    if (this.PromiseState !== 'pending') return;
    // 如果执行reject，状态变为rejected
    this.PromiseState = 'rejected';
    // 终值为传进来的reason
    this.PromiseResult = reason;
    // 执行保存的失败回调
    queueMicrotask(() => {
      while (this.onRejectedCallbacks.length) {
        this.onRejectedCallbacks.shift()(this.PromiseResult);
      }
    });
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
