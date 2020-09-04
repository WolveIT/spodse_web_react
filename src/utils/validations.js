export const isValidPhone = (phone) => {
  const pattern = /((\+92)|(0092))-{0,1}\d{3}-{0,1}\d{7}$|^\d{11}$|^\d{4}-\d{7}$/g;
  return pattern.test(phone);
};

export const isValidEmail = (email) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const isValidName = (name) =>
  typeof name === "string" && name.length >= 3;

export const isValidPassword = (pass) =>
  typeof pass === "string" && pass.length >= 6;
