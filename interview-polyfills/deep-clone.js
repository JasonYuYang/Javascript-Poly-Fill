///shallow clone1
function clone(target) {
  let cloneTarget = {};
  for (const key in target) {
    cloneTarget[key] = target[key];
  }
  return cloneTarget;
}
//deepclone1
function deepclone1(target) {
  return JSON.parse(JSON.stringify(target));
}
// 这种方法虽然可以实现数组或对象深拷贝,但不能处理函数和正则，因为这两者基于JSON.stringify和JSON.parse处理后，得到的正则就不再是正则（变为空对象），得到的函数就不再是函数（变为null）了。
// JSON.parse(JSON.stringify(target))报错TypeError: Converting circular structure to JSON，意思是无法处理环引用

///deepclone王者版

// 1.判断是否为引用类型
//我们还需要考虑function和null两种特殊的数据类型
function isObject(target) {
  const type = typeof target;
  return target !== null && (type === 'object' || type === 'function');
}

// 2.获取数据类型
//https://juejin.cn/post/6844903929705136141#heading-9
// 我们可以使用toString来获取准确的引用类型：

// 每一个引用类型都有toString方法，默认情况下，toString()方法被每个Object对象继承。如果此方法在自定义对象中未被覆盖，toString() 返回 "[object type]"，其中type是对象的类型。

// 注意，上面提到了如果此方法在自定义对象中未被覆盖，toString才会达到预想的效果，事实上，大部分引用类型比如Array、Date、RegExp等都重写了toString方法。
// 我们可以直接调用Object原型上未被覆盖的toString()方法，使用call来改变this指向来达到我们想要的效果。
function getType(target) {
  return Object.prototype.toString.call(target);
}
// 可遍历的类型
const mapTag = '[object Map]';
const setTag = '[object Set]';
const arrayTag = '[object Array]';
const objectTag = '[object Object]';

// 不可遍历类型

const dateTag = '[object Date]';
const errorTag = '[object Error]';
const regexpTag = '[object RegExp]';
const symbolTag = '[object Symbol]';
const funcTag = '[object Function]';

// 将可遍历类型存在一个数组里
const canForArr = ['[object Map]', '[object Set]', '[object Array]', '[object Object]'];

// 将不可遍历类型存在一个数组
const noForArr = [
  '[object Date]',
  '[object Error]',
  '[object Symbol]',
  '[object RegExp]',
  '[object Function]',
];
// 可继续遍历的类型
// 上面我们已经考虑的object、array都属于可以继续遍历的类型，因为它们内存都还可以存储其他数据类型的数据，另外还有Map，Set等都是可以继续遍历的类型，这里我们只考虑这四种，如果你有兴趣可以继续探索其他类型。
// 有序这几种类型还需要继续进行递归，我们首先需要获取它们的初始化数据，例如上面的[]和{}，我们可以通过拿到constructor的方式来通用的获取。
// 例如：const target = {}就是const target = new Object()的语法糖。另外这种方法还有一个好处：因为我们还使用了原对象的构造方法，所以它可以保留对象原型上的数据，如果直接使用普通的{}，那么原型必然是丢失了的。

function getOriginInit(target) {
  let con = target.constructor;
  //有人提出用Object.create(target.constructor.prototype)，但Map會丟失一些method所以不用
  return new con();
}
//不可继续遍历的类型
// 其他剩余的类型我们把它们统一归类成不可处理的数据类型，我们依次进行处理：
// Date、Error这几种类型我们都可以直接用构造函数和原始数据创建一个新对象：

//複製Symbol類型
function cloneSymbol(target) {
  return Object(Symbol.prototype.valueOf.call(target));
}
//複製Regex類型
function cloneReg(target) {
  const reFlags = /\w*$/;
  const result = new target.constructor(target.source, reFlags.exec(target));
  result.lastIndex = target.lastIndex;
  return result;
}
//複製func類型
// 可见这里如果发现是函数的话就会直接返回了，没有做特殊的处理，但是我发现不少面试官还是热衷于问这个问题的，而且据我了解能写出来的少之又少。。。
// 实际上这个方法并没有什么难度，主要就是考察你对基础的掌握扎实不扎实。
// 首先，我们可以通过prototype来区分下箭头函数和普通函数，箭头函数是没有prototype的。
// 我们可以直接使用eval和函数字符串来重新生成一个箭头函数，注意这种方法是不适用于普通函数的。
// 我们可以使用正则来处理普通函数：
// 分别使用正则取出函数体和函数参数，然后使用new Function ([arg1[, arg2[, ...argN]],] functionBody)构造函数重新构造一个新的函数：

function cloneFunction(func) {
  const bodyReg = /(?<={)(.|\n)+(?=})/m;
  const paramReg = /(?<=\().+(?=\)\s+{)/;
  const funcString = func.toString();
  if (func.prototype) {
    console.log('普通函数');
    const param = paramReg.exec(funcString);
    const body = bodyReg.exec(funcString);
    if (body) {
      console.log('匹配到函数体：', body[0]);
      if (param) {
        const paramArr = param[0].split(',');
        console.log('匹配到参数：', paramArr);
        return new Function(...paramArr, body[0]);
      } else {
        return new Function(body[0]);
      }
    } else {
      return null;
    }
  } else {
    return eval(funcString);
  }
}

function noForArrClone(target) {
  const type = getType(target);
  switch (type) {
    case errorTag:
      return getOriginInit(target);
    case dateTag:
      return getOriginInit(target);
    case regexpTag:
      return cloneReg(target);
    case symbolTag:
      return cloneSymbol(target);
    case funcTag:
      return cloneFunction(target);
    default:
      return null;
  }
}

function deepclone(target, map = new Map()) {
  //排除null
  if (!isObject(target)) {
    return target;
  }
  let cloneTarget;
  //取得target數據類型
  const type = getType(target);
  //假如是canForArr類型裡面就初始化cloneTarget;
  if (canForArr.includes(type)) {
    cloneTarget = getOriginInit(target);
  } else {
    return noForArrClone(target);
  }
  // 防止循环引用
  // 检查map中有无克隆过的对象
  // 有 - 直接返回
  // 没有 - 将当前对象作为key，克隆对象作为value进行存储
  // 继续克隆
  if (map.get(target)) {
    return map.get(target);
  }
  map.set(target, cloneTarget);

  //處理Set數據類型
  if (type === setTag) {
    target.forEach(value => {
      cloneTarget.add(deepclone(value, map));
    });
    return cloneTarget;
  }
  //處理Map數據類型
  if (type === mapTag) {
    target.forEach((value, key) => {
      cloneTarget.set(key, deepclone(value, map));
    });
    return cloneTarget;
  }
  //處理Object數據類型
  if (type === objectTag) {
    for (const key in target) {
      cloneTarget[key] = deepclone(target[key]);
    }
    return cloneTarget;
  }
  //處理Array數據類型
  if (type === arrayTag) {
    target.forEach((value, index) => {
      cloneTarget[index] = deepclone(target[index]);
    });
    return cloneTarget;
  }
}

//https://juejin.cn/post/6844903929705136141#heading-14
//https://juejin.cn/post/6844903929705136141#heading-0
