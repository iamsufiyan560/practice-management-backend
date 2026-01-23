import crypto from "crypto";

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+[]{}|;:,.<>?";

const ALL = UPPERCASE + LOWERCASE + NUMBERS + SYMBOLS;

type GeneratePasswordOptions = {
  minLength?: number; // default 12
  maxLength?: number; // default 16
};

function getRandomInt(min: number, max: number) {
  return crypto.randomInt(min, max + 1);
}

function getRandomChar(str: string) {
  return str[crypto.randomInt(0, str.length)];
}

function shuffleString(str: string) {
  return str
    .split("")
    .sort(() => crypto.randomInt(-1, 2))
    .join("");
}

export function generateSecurePassword(
  options: GeneratePasswordOptions = {},
): string {
  const minLength = options.minLength ?? 12;
  const maxLength = options.maxLength ?? 16;

  if (minLength < 8) {
    throw new Error("Password min length should be >= 8");
  }

  const length = getRandomInt(minLength, maxLength);

  let password = [
    getRandomChar(UPPERCASE),
    getRandomChar(LOWERCASE),
    getRandomChar(NUMBERS),
    getRandomChar(SYMBOLS),
  ];

  for (let i = password.length; i < length; i++) {
    password.push(getRandomChar(ALL));
  }

  return shuffleString(password.join(""));
}
