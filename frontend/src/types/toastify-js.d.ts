// toastify-js has no official types and isn't in the approved dep list, so
// only the shape we actually use is declared here.
declare module "toastify-js" {
  interface ToastifyOptions {
    text?: string;
    duration?: number;
    close?: boolean;
    gravity?: string;
    position?: string;
    stopOnFocus?: boolean;
    style?: Record<string, string>;
  }

  interface ToastifyInstance {
    showToast(): void;
  }

  function Toastify(options: ToastifyOptions): ToastifyInstance;

  export default Toastify;
}
