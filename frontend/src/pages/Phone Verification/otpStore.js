// src/utils/otpStore.js
let confirmationResult = null;

export const setConfirmationResult = (result) => {
  confirmationResult = result;
};

export const getConfirmationResult = () => confirmationResult;
