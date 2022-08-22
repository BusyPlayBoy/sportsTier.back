/**
 * 입력된 초만큼 아무 것도 하지 않는 함수, await와 사용할 경우 코드적으로 대기를 구현할 수 있음
 * @param {Number} sec 대기할 초 
 * @returns {Promise} sec 초를 대기하는 setTimeout 함수의 Promise 객체를 반환 
 */
 function sleep(sec) {
    return new Promise((resolve) => setTimeout(resolve, 1000 * sec));
  }

export {sleep};