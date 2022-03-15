// //6. 实现new操作符
// 思路： 在实现new之前，我们先了解一下new的执行过程
// new 关键字会进行如下的操作：
// new操作符做了这些事：

// 它创建了一个全新的对象。
// 它会被执行[[Prototype]]（也就是__proto__）链接。
// 它使this指向新创建的对象。。
// 通过new创建的每个对象将最终被[[Prototype]]链接到这个函数的prototype对象上。
// 如果函数没有返回对象类型Object(包含Functoin, Array, Date, RegExg, Error)，那么new表达式中的函数调用将返回该对象引用。

function mynNew(func, ...args) {
  let obj = Object.create(func.prototype);
  let result = func.apply(obj, args);
  return result ? result : obj;
}

//不用object.create
function New(func, ...args) {
  var res = {};
  if (func.prototype !== null) {
    res.__proto__ = func.prototype;
  }
  var ret = func.apply(res, args);
  if ((typeof ret === 'object' || typeof ret === 'function') && ret !== null) {
    return ret;
  }
  return res;
}
var obj = New(A, 1, 2);
// equals to
var obj = new A(1, 2);
