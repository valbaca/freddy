/**
 * A JSON Parser so bad it's SCARY!!! Like Jason and Freddy Krueger!!!
 *
 * Bad: Error Handling, variable naming, inefficient
 *
 * Doesn't fully/properly handle: whitespace or numbers as per spec.
 * Just uses ' ' for whitespace and abuses Number(string) for Number parsing.
 *
 * Nearly everything returns [index, value] where index is where the parser pointer is AT but has not fully consumed
 */

type json = object | object[] | string | number | boolean | null;

export function parse(s: string): json {
  const x = parseValue(s, 0);
  let i = x[0];
  let value = x[1];
  if (i == s.length || s.slice(i).trim() == "") {
    // if the parser reached the end (sans whitespace) then it parsed properly and is valid JSON
    return value;
  } else throw new Error(`s=${s} i=${i} value=${JSON.stringify(value)}`); // terrible debugging
}

function parseValue(s: string, start: number): [number, json] {
  let i = start;
  i = eat(s, i);
  let si = s.slice(i);
  if (si.startsWith("true")) {
    return [i + 4, true];
  } else if (si.startsWith("false")) {
    return [i + 5, false];
  } else if (si.startsWith("null")) {
    return [i + 4, null];
  }
  let c = s[i];
  if (c == "{") return parseObject(s, i + 1);
  if (c == "[") return parseArray(s, i + 1);
  if (c == '"') {
    let j = findEndQuote(s, i);
    const str = s.slice(i + 1, j); // slide excludes the quotes
    return [j + 1, str];
  } else {
    return parseNumber(s, i);
  }
}

/* eat whitespace (if any) */
function eat(s: string, i: number) {
  while (i < s.length && s[i] == " ") i += 1; // eat whitespace
  if (i == s.length) throw new Error();
  return i;
}

function findEndQuote(s: string, start: number): number {
  let esc = false;
  let j = start + 1;
  while (j < s.length) {
    if (esc) {
      esc = false;
    } else if (s[j] == "\\") {
      esc = true;
    } else if (s[j] == '"') {
      return j;
    }
    j += 1;
  }
  throw new Error();
}

function parseNumber(s: string, start: number): [number, number] {
  // a bit hacky, find an "end" and try to parse that as a number
  let i = start;
  let chars = [];
  while (i < s.length) {
    let c = s[i];
    if ("0123456789.eE-+abcdefABCDEF".includes(c)) {
      chars.push(c);
    } else {
      break;
    }
    i += 1;
  }
  let str = chars.join("");
  let num = Number(str); // bit of a cheat
  if (isNaN(num)) throw new Error();
  return [i, num];
}

/**
 * object:
 *   '{' ws '}'
 *   '{' members '}'
 */
function parseObject(s: string, start: number): [number, object] {
  let obj: any = {};

  let i = start;
  while (true) {
    // Parse Key
    i = eat(s, i);
    if (s[i] == "}") {
      // close of object
      i += 1;
      break;
    }

    if (s[i] != '"') throw new Error();
    let j = findEndQuote(s, i);
    if (j > s.length) throw new Error();
    const key: string = s.slice(i + 1, j);
    i = j + 1;
    i = eat(s, i);
    if (s[i] != ":") throw new Error();
    i += 1;
    i = eat(s, i);
    // Parse Value
    let p = parseValue(s, i);
    i = p[0];
    obj[key] = p[1];
    i = eat(s, i);

    if (s[i] == "}") {
      i += 1;
      break;
    } else if (s[i] !== ",") {
      throw new Error();
    }
    i += 1;
  }

  return [i, obj];
}

function parseArray(s: string, start: number): [number, object[]] {
  let arr: any[] = [];
  let i = start;
  while (true) {
    i = eat(s, i);
    if (s[i] == "]") {
      i += 1;
      break;
    }

    // Parse Value
    let p = parseValue(s, i);
    i = p[0];
    arr.push(p[1]);
    i = eat(s, i);
    if (s[i] == "]") {
      i += 1;
      break;
    } else if (s[i] !== ",") {
      throw new Error();
    }
    i += 1;
  }
  return [i, arr];
}

// console.log(parse(argv[2]));
