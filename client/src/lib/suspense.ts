/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoaderFunctionArgs } from "react-router-dom";

export function withSuspense(fn: (_: LoaderFunctionArgs) => Promise<any>) {
  return function (...args: any[]) {
    let status = "pending";
    let response: any;

    // @ts-expect-error Suspense
    const suspender = fn(...args).then(
      (res) => {
        status = "success";
        response = res;
      },
      (err) => {
        status = "error";
        response = err;
      }
    );

    return () => {
      switch (status) {
        case "pending":
          throw suspender;
        case "error":
          throw response;
        default:
          return response;
      }
    };
  };
}
