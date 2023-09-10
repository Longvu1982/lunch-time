function percentToHex(percent) {
    if(!percent) return "ff"
    // Ensure that the percent value is within the range [0, 100]
    percent = Math.min(100, Math.max(0, percent));
  
    // Convert the percent to a decimal value
    const decimalValue = percent / 100;
  
    // Calculate the corresponding value in the range [0, 255]
    const rangeValue = Math.round(decimalValue * 255);
  
    // Convert the range value to a 2-digit hexadecimal string
    const hexValue = rangeValue.toString(16).padStart(2, '0');
  
    // Return the hexadecimal string
    return hexValue;
  }

export function getRandomHexColor(transparentPercent ) {
  // Generate a random integer between 0 and 16777215 (0xFFFFFF in hexadecimal)
  const randomColor = Math.floor(Math.random() * 16777215);

  // Convert the random number to a 6-digit hex string
  const hexColor = randomColor.toString(16).padStart(6, "0");

  const hexPercent = percentToHex(transparentPercent)

  // Prepend a '#' to the hex color string
  return `#${hexColor}${hexPercent}`;
}
