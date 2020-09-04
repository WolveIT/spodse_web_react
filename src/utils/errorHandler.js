import { message } from "antd";

/*
    namespace: string (reqd)
    error: obj Error (reqd)
    stopLoading: boolean=false (optional)
*/
export const localErrorHandler = ({ namespace, error, stopLoading }) => {
  throw { error, stopLoading, namespace };
};

export const globalErrorHandler = (e, dispatch) => {
  //prevent default behavior of throwing exception
  e.preventDefault && e.preventDefault();
  let error = e;
  //if 'error' field is present, this means this error has been thrown by error handler
  if (e.error) error = e.error;
  console.error(error);
  //if 'message' field is present then show the error message
  if (error.message || typeof error === "string") {
    message.error(error.message);
  }
  //else just show hard coded message
  else message.error("An unknown error occurred!");
  //if 'stopLoading' field is sent by the handler then stopLoading that module
  if (e.stopLoading && dispatch)
    dispatch({
      type: `${e.namespace}/stopLoading`,
      loadingType: e.stopLoading,
    });
};
