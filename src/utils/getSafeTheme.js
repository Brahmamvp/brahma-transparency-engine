// src/utils/getSafeTheme.js
import { themes } from "../styles/themes.js";

const getSafeTheme = (themeName) => {
  return themes[themeName] || themes.dark;
};

export default getSafeTheme;
