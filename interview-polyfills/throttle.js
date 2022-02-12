//面試基本版
//時間戳
function throttleDate(method, wait) {
  // 对比时间戳，初始化为0则首次触发立即执行，初始化为当前时间戳则wait毫秒后触发才会执行
  let previous = 0;
  return function (...args) {
    let now = new Date().getTime();
    // 间隔大于wait则执行method并更新对比时间戳
    if (now - previous > wait) {
      method.apply(this, args);
      previous = now;
    }
  };
}
//setTimeout
function throttleSetTimeout(method, wait) {
  let timeout;
  return function (...args) {
    let context = this;
    if (!timeout) {
      timeout = setTimeout(() => {
        timeout = null;
        method.apply(context, args);
      }, wait);
    }
  };
}

//完整版
function throttle(method, wait) {
  let timeout;
  let previous = 0;
  return function (...args) {
    let context = this;
    let now = new Date().getTime();
    // 距离下次函数执行的剩余时间
    let remaining = wait - (now - previous);
    // 如果无剩余时间或系统时间被修改
    if (remaining <= 0 || remaining > wait) {
      // 如果定时器还存在则清除并置为null
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      // 更新对比时间戳并执行函数
      previous = now;
      method.apply(context, args);
    } else if (!timeout) {
      // 如果有剩余时间但定时器不存在，则设置定时器
      // remaining毫秒后执行函数、更新对比时间戳
      // 并将定时器置为null
      timeout = setTimeout(() => {
        previous = new Date().getTime();
        timeout = null;
        method.apply(context, args);
      }, remaining);
    }
  };
}
//https://juejin.cn/post/6844903705763020807#heading-8
