window.fetch = (function (fetch) {
  return function (...args) {
    return interceptor(fetch, ...args);
  };
})(env.fetch);

let interceptors = [];

function interceptor(fetch, ...args) {
  const reversedInterceptors = interceptors.reduce((array, interceptor) => [interceptor].concat(array), []);
  let promise = Promise.resolve(args);

  // Register request interceptors
  reversedInterceptors.forEach(({ request, requestError }) => {
    if (request || requestError) {
      promise = promise.then(args => request(...args), requestError);
    }
  });

  // Register fetch call
  promise = promise.then(args => fetch(...args));

  // Register response interceptors
  reversedInterceptors.forEach(({ response, responseError }) => {
    if (response || responseError) {
      promise = promise.then(response, responseError);
    }
  });

  return promise;
}

module.exports = {
  register: function (interceptor) {
    interceptors.push(interceptor);
    return () => {
      const index = interceptors.indexOf(interceptor);
      if (index >= 0) {
        interceptors.splice(index, 1);
      }
    };
  },
  clear: function () {
    interceptors = [];
  }
};
