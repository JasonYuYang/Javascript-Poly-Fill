function fn(nums) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(nums * 2);
    }, 1000);
  });
}
function* gen() {
  const num1 = yield fn(1);
  const num2 = yield fn(num1);
  const num3 = yield fn(num2);
  return num3;
}

function generatorToAsync(generatorFn) {
  return function () {
    const gen = generatorFn.apply(this, arguments); // gen有可能传参
    // 返回一个Promise
    return new Promise((resolve, reject) => {
      // 内部定义一个go函数 用来一步一步的跨过yield的阻碍
      // key有next和throw两种取值，分别对应了gen的next和throw方法
      // arg参数则是用来把promise resolve出来的值交给下一个yield

      function go(key, arg) {
        let res;
        try {
          res = gen[key](arg); // 这里有可能会执行返回reject状态的Promise
        } catch (error) {
          return reject(error); // 报错的话会走catch，直接reject
        }

        // 解构获得value和done
        const { value, done } = res;
        if (done) {
          // 如果done为true，说明走完了，进行resolve(value)
          return resolve(value);
        } else {
          // 如果done为false，说明没走完，还得继续走
          // 除了最后结束的时候之外，每次调用gen.next()
          // 其实是返回 { value: Promise, done: false } 的结构，
          // 这里要注意的是Promise.resolve可以接受一个promise为参数
          // 并且这个promise参数被resolve的时候，这个then才会被调用

          // value有可能是：常量，Promise，Promise有可能是成功或者失败
          return Promise.resolve(value).then(
            // value这个promise被resolve的时候，就会执行next
            // 并且只要done不是true的时候 就会递归的往下解开promise
            // 对应gen.next().value.then(value => {
            //      gen.next(value).value.then(value2 => {
            //       gen.next()
            //
            //      // 此时done为true了 整个promise被resolve了
            //      // 最外部的asyncFn().then(res => console.log(res))的then就开始执行了
            //    })
            // })

            val => go('next', val),
            // 如果promise被reject了 就再次进入go函数
            // 不同的是，这次的try catch中调用的是gen.throw(err)
            // 那么自然就被catch到 然后把promise给reject掉啦

            err => go('throw', err)
          );
        }
      }

      go('next'); // 第一次执行
    });
  };
}

const asyncFn = generatorToAsync(gen);

asyncFn().then(res => console.log(res));

// 7张图，20分钟就能搞定的async/await原理！为什么要拖那么久？
//https://juejin.cn/post/7007031572238958629#heading-14
//
//手写async await的最简实现（20行）
//https://juejin.cn/post/6844904102053281806#heading-3
