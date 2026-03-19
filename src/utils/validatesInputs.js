// Validaciones individuales
export const validateName = (name) => {
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  return regex.test(name) && name.trim().length > 0;
};

export const validateEmail = (emailValue) => {
  const regex = /^[^\s@]+@elpoli\.edu\.co$/;
  return regex.test(emailValue);
};

export const validatePassword = (pass) => {
  // Mínimo 8 caracteres, 1 mayúscula, 1 número, 1 símbolo
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(pass);
};

export const validatePasswords = (pass, confirmPass) => {
  return pass === confirmPass && pass.length > 0;
};
