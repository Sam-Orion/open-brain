export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const USERNAME_REGEX = /^[a-z0-9]{3,20}$/;
export const PASSWORD_REGEX =
  /^(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

// More granular password validation for UI checklists
export const PASSWORD_MIN_LENGTH_REGEX = /.{8,}/;
export const PASSWORD_NUMBER_REGEX = /.*\d.*/;
export const PASSWORD_SPECIAL_CHAR_REGEX =
  /.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?].*/;
