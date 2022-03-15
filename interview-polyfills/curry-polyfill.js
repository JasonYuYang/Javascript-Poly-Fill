function currying(fn, ...args1) {
  // 获取fn参数有几个
  //https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Function/length
  const length = fn.length;
  let allArgs = [...args1];
  const res = (...arg2) => {
    allArgs = [...allArgs, ...arg2];
    // 长度相等就返回执行结果
    if (allArgs.length === length) {
      return fn(...allArgs);
    } else {
      // 不相等继续返回函数
      return res;
    }
  };
  return res;
}

// 测试：
const add = (a, b, c) => a + b + c;
const a = currying(add, 1);
console.log(a(2, 3));
