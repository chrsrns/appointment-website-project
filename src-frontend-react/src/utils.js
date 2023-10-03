import Cookies from 'universal-cookie';

export const customFetch = (url, options = {}) => {
  const cookies = new Cookies(null, { path: '/' });
  console.log("AccessToken:")
  console.log(cookies.get('accessToken'))

  // Define the default headers you want to add to each request
  const defaultHeaders = {
    'Authorization': `Bearer ${cookies.get('accessToken')}`, // Replace with your desired header
    'Content-Type': 'application/json' // Replace with your desired content type
  };

  // Merge the default headers with the provided options
  const mergedOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  // Use the fetch function with the modified options
  return fetch(url, mergedOptions);
}
