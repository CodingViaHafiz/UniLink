import { toast } from "react-toastify";

const baseOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const notifySuccess = (message) => toast.success(message, baseOptions);
export const notifyError = (message) => toast.error(message, baseOptions);
export const notifyInfo = (message) => toast.info(message, baseOptions);
