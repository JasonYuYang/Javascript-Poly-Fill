// leading为控制首次触发时是否立即执行函数的配置项
// trailing为控制停止触发后是否还执行一次的配置项
function throttleFin(fn, wait, { leading = true, trailing = true } = {}) {
  let timeout;
  let previous = 0;
  let result; //節流函數回傳值
  let throttledfn = function (...args) {
    // 返回一个Promise，以便可以使用then或者Async/Await语法拿到原函数返回值
    //https://juejin.cn/post/6844903705763020807#heading-12
    return new Promise(resolve => {
      let now = new Date().getTime();
      // !previous代表首次触发或定时器触发后的首次触发，若不需要立即执行则将previous更新为now
      // 这样remaining = wait > 0，则不会立即执行，而是设定定时器
      if (!previous && leading === false) previous = now;
      let remaining = wait - (now - previous);
      if (remaining <= 0) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = fn.apply(this, args);
        // 将函数执行返回值传给resolve
        resolve(result);
        // 如果有剩余时间但定时器不存在，且trailing不为false，则设置定时器
        // trailing为false时等同于只使用时间戳来实现节流
      } else if (!timeout && trailing !== false) {
        timeout = setTimeout(() => {
          // 如果leading为false，则将previous设为0，
          // 下次触发时会与下次触发时的now同步，达到首次触发（对于用户来说）不立即执行(也就是下一次觸發也會等wait時間再觸發)
          // 如果直接设为当前时间戳，若停止触发一段时间，下次触发时的remaining为负值，会立即执行
          previous = leading === false ? 0 : new Date().getTime();
          timeout = null;
          result = fn.apply(this, args);
          // 将函数执行返回值传给resolve
          resolve(result);
        }, remaining);
      }
    });
  };

  // 加入取消功能，使用方法如下
  // let throttledFn = throttle(otherFn)
  // throttledFn.cancel()
  throttledfn.cancel = function () {
    clearTimeout(timeout);
    timeout = null;
    previous = 0;
  };
  // 将节流后函数返回
  return throttledfn;
}
//https://codepen.io/logan70/pen/EOjBbb/?editors=1010
