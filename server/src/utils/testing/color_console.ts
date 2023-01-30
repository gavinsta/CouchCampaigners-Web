const white = "\u001b[0m"
export function log(keyword: string, text: string, color: "green" | "red" | "yellow" | "blue" | "purple" | "cyan" = "red") {
  let colorText;


  if (color == "red") {
    colorText = "\u001b[1;31m"
  }
  if (color == "green") {
    colorText = "\u001b[1;32m"
  }
  if (color == "yellow") {
    colorText = "\u001b[1;33m"
  }
  if (color == "blue") {
    colorText = "\u001b[1;34m"
  }
  if (color == "purple") {
    colorText = "\u001b[1;35m"
  }
  if (color == "cyan") {
    colorText = "\u001b[1;36m"
  }

  console.log(colorText + keyword + white + text)
}

export function logWarning(text: string) {
  console.log("\u001b[1;43m WARNING:" + white + " " + text);
}

export function logError(text: string) {
  console.log("\u001b[1;41m ERROR:" + white + " " + text);
}
/*
Different colors
console.log( "\u001b[1;41m Red background" );
console.log( "\u001b[1;42m Green background" );
console.log( "\u001b[1;43m Yellow background" );
console.log( "\u001b[1;44m Blue background" );
console.log( "\u001b[1;45m Purple background" );
console.log( "\u001b[1;46m Cyan background" );
*/