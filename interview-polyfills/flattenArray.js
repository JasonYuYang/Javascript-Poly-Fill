function flat1(arr) {
  return arr.reduce((result, item) => {
    return result.concat(Array.isArray(item) ? flat1(item) : item);
  }, []);
}
//test
let arr = [1, [2, 3, 4], [5, [6, [7, [8]]]]];
console.log(flat1(arr));
