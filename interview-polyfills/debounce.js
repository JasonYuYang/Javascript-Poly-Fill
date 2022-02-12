/**
 * @desc 函数防抖
 * @param func 回调函数
 * @param wait 延迟执行毫秒数
 */
//基本版
function debounce(func, wait) {
  let timeout = null;
  return function (...args) {
    //如果timeout存在，先清除定时器（其实就是每次执行都清除定时器，判断是否存在只是为了严谨）
    timeout ? clearTimeout(timeout) : null;
    timeout = setTimeout(() => {
      //是为了让 debounce 函数最终返回的函数 this 指向不变以及依旧能接受到 e 参数。
      //不使用apply绑定this func执行时this是window
      func.apply(this, args);
    }, wait);
  };
}
document.body.onclick = debounce(function () {
  console.log(this);
}, 1000);
//立馬執行版
function debounceRightNow(func, delay) {
  let timeoutId = null;
  let clearTimeoutId = null;
  return function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
      clearTimeout(clearTimeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        clearTimeoutId = setTimeout(() => {
          timeoutId = null;
        }, delay);
      }, delay);
    } else {
      func.apply(this, args);
      // 为了解决只触发一次，会同时触发首次触发和延时触发的问题引入的特殊值
      timerId = -1;
      //不是true也不是false
    }
  };
}
//https://juejin.cn/post/6844903495745683464#heading-1
