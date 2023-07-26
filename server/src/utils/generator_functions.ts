export const defaultSettings = {
  ROOM_CODE_LENGTH: 6,
  KEY_LENGTH: 5,
  KEY_RANDOM: false,
};

export enum KeyGenerationSettings {
  NO_NUMBERS = "NO_NUMBERS",
  NO_LETTERS = "NO_LETTERS",
  ALTERNATING = "ALTERNATING",
  RANDOM = "RANDOM",
}
/**
 * Use to generate a random code. Generation of Controller Keys should be left up to Unity
 * @param {number} length
 * @param {KeyGenerationSettings} keyGenerationSettings whether the code will switch between letter and number randomly
 */
const generateKey = (
  length?: number,
  keyGenerationSettings: KeyGenerationSettings = KeyGenerationSettings.ALTERNATING
) => {
  var s = "";
  if (length === undefined) length = defaultSettings.ROOM_CODE_LENGTH;
  var randomCapitalChar = function () {
    var n = Math.floor(Math.random() * 26) + 65;
    return String.fromCharCode(n);
  };
  var randomNumber = function () {
    var n = Math.floor(Math.random() * 10);
    return n;
  };
  while (s.length < length) {
    switch (keyGenerationSettings) {
      case KeyGenerationSettings.NO_LETTERS:
        s += randomNumber();
        break;
      case KeyGenerationSettings.NO_NUMBERS:
        s += randomCapitalChar();
        break;
      case KeyGenerationSettings.ALTERNATING:
        if (s.length % 2 == 0) {
          s += randomCapitalChar();
        } else {
          s += randomNumber();
        }
        break;
      case KeyGenerationSettings.RANDOM:
        s += Math.round(Math.random()) ? randomCapitalChar() : randomNumber();
        break;
    }
  }
  return s;
};
/**
 *
 * @returns A random color name
 */
const randomColor = () => {
  const colors = [
    "Maroon",
    "Crimson",
    "Red",
    "Orange",
    "Gold",
    "Tangerine",
    "Yellow",
    "Lime",
    "Green",
    "Teal",
    "Blue",
    "Azure",
    "Indigo",
    "Violet",
  ];
  return colors.at(Math.floor(Math.random() * colors.length));
};

export { randomColor, generateKey };
