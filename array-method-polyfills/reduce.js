Array.prototype.myReduce = function (callback, initialValue) {
  let accumulator = initialValue;
  let i = 0;
  const length = this.length;

  if (typeof accumulator === 'undefined') {
    accumulator = this[0];
    i = 1;
  }
  while (i < length) {
    accumulator = callback(accumulator, this[i], i, this);
    //callback(accumulator,currentValue,index,array)
    i++;
  }
  return accumulator;
};
