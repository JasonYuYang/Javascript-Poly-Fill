function* gen1() {
  yield 1;
  yield 2;
  yield 3;
}
const g1 = gen1();
console.log(g1.next()); // { value: 1, done: false }
console.log(g1.next()); // { value: 2, done: false }
console.log(g1.next()); // { value: 3, done: false }
console.log(g1.next()); // { value: undefined, done: true }
///////////////////////////////////////////////////////////
function* gen2() {
  yield 1;
  yield 2;
  yield 3;
  return 4;
}
const g2 = gen2();
console.log(g2.next()); // { value: 1, done: false }
console.log(g2.next()); // { value: 2, done: false }
console.log(g2.next()); // { value: 3, done: false }
console.log(g2.next()); // { value: 4, done: true }
//////////////////////////////////////////////////////////
function* gen3() {
  const num1 = yield 1;
  console.log(num1);
  const num2 = yield 2;
  console.log(num2);
  return 3;
}
const g3 = gen3();
console.log(g3.next()); // { value: 1, done: false }
console.log(g3.next(11111));
// 11111
//  { value: 2, done: false }
console.log(g3.next(22222));
// 22222
// { value: 3, done: true }
///////////////////////////////////////////////////////////

function fn(nums) {
  return new Promise(resolve => {
    setTimeout(resolve(nums * 2), 1000);
  });
}
function* gen() {
  const num1 = fn(1);
  const num2 = fn(num1);
  const num3 = fn(num2);
  const num4 = fn(num3);

  return num4;
}

function generatorToAsync(generatorFn) {
  return function () {
    const g = generatorFn.apply(this, arguments);
    return new Promise((resolve, reject) => {
      function go(key, arg) {
        let res;
        try {
          res = g[key](arg);
        } catch (err) {
          reject(err);
        }
        const { value, done } = res;
        if (done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(
            val => go('next', val),
            err => go('throw', err)
          );
          //g[key](arg)當key==next將回傳{ value: Promise { val }, done: false }
          //Promise.resolve(value)其中value=Promise{ val }所以直接回傳原本的Promise
          // 对应gen.next().value.then(val => {
          //    gen.next(val).value.then(val2 => {
          //       gen.next()
          //
          //      // 此时done为true了 整个promise被resolve了
          //      // 最外部的asyncFn().then(res => console.log(res))的then就开始执行了
          //    })
          // })
        }
      }
      //這裡相當於第一次g.next()
      go('next');
    });
  };
}
const genToAsync = generatorToAsync(gen);
const asyncRes = genToAsync();
console.log(asyncRes); // Promise
asyncRes.then(res => console.log(res)); // 8
