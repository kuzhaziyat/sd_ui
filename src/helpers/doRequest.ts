export const doRequest = (url: string, params: RequestInit): Promise<{ response: any }> => {
  const options: RequestInit = {
    ...params,
    credentials: "include",
  };
  return new Promise(function (resolve, reject) {
    fetch(`${process.env.VUE_APP_API_URL}${url}`, options)
      .then((response) => response.json())
      .then((result: any) => {
        if (result.error) reject(result.response);
        return resolve({ response: result.response });
      })
      .catch((error) => {
        reject(error);
      });
  });
};
