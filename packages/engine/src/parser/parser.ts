export type ParsedPart = (
  | {
      type: 'part' | 'expression';
      value: string;
    }
  | {
      type: 'operator';
      value: string;
    }
  | {
      type: 'string';
      parts: ParsedPart[];
      char: '"' | "'" | '`';
    }
  | {
      type: 'raw-string';
      value: string;
    }
) & { start: number; end: number };

export const parse = (code: string) => {
  // Parses out commands and expressions
  // expression = { ... }
  // operators = | < >

  let inExpression = false;
  let inExpressionString = false;
  let inExpressionStringChar = '';
  let inOperator = false;
  let inString = false;
  let stringChar = '';
  let inComment = false;
  let inMultilineComment = false;

  let expression = '';
  let expressionBracketBalance = 0;
  let command = '';
  let string = '';
  let comment = '';
  let multilineComment = '';
  let operator = '';
  let output: ParsedPart[] = [];

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const nextChar = code[i + 1];
    const prevChar = code[i - 1];

    if (inString && !inExpression) {
      if (char === stringChar && prevChar !== '\\') {
        inString = false;
        if (stringChar == '`') {
          output[output.length - 1].parts.push({
            type: 'raw-string',
            value: string,
            start: i - string.length,
            end: i
          });
          output[output.length - 1].end = i + 1;
        } else {
          output.push({
            type: 'string',
            char: stringChar,
            parts: [
              {
                type: 'raw-string',
                value: string,
                start: i - string.length,
                end: i
              }
            ],
            start: i - string.length - 1,
            end: i + 1
          });
        }
        string = '';
      }

      let docont = true;
      string += char;
      if (stringChar == '`') {
        if (char === '{') {
          inExpression = true;
          expressionBracketBalance++;

          output[output.length - 1].parts.push({
            type: 'raw-string',
            value: string.slice(0, string.length - 1),
            start: i - string.length,
            end: i
          });
          string = '';
        }
      }

      if (docont) {
        continue;
      }
    }

    if (inExpression) {
      expression += char;
      if (inExpressionString) {
        if (char == inExpressionStringChar && prevChar !== '\\') {
          inExpressionString = false;
        }
        continue;
      }

      if (inComment) {
        comment += char;

        if (char === '\n') {
          inComment = false;
          comment = '';
        }
        continue;
      }

      if (inMultilineComment) {
        multilineComment += char;
        if (char === '*' && nextChar === '/') {
          inMultilineComment = false;
          multilineComment = '';
          i++;
        }
        continue;
      }

      if (char === '"' || char == "'" || char == '`') {
        inExpressionString = true;
        inExpressionStringChar = char;
      }

      if (char === '{') {
        expressionBracketBalance++;
      }

      if (char === '}') {
        expressionBracketBalance--;
        if (expressionBracketBalance <= 0) {
          inExpression = false;
          if (inString) {
            output[output.length - 1].parts.push({
              type: 'expression',
              value: expression.slice(0, expression.length - 1),
              start: i - expression.length,
              end: i
            });
          } else {
            output.push({
              type: 'expression',
              value: expression.slice(0, expression.length - 1),
              start: i - expression.length,
              end: i
            });
          }
          expression = '';
        }
      }

      if (char === '/' && nextChar === '/') {
        inComment = true;
        continue;
      }

      if (char === '/' && nextChar === '*') {
        inMultilineComment = true;
        continue;
      }

      continue;
    }

    if (inOperator) {
      operator += char;
      if (char === '|') {
        inOperator = false;
        output.push({ type: 'operator', value: operator, start: i - operator.length, end: i });
        operator = '';
      }
      continue;
    }

    if (char === '{') {
      inExpression = true;
      expressionBracketBalance++;
      continue;
    }

    if (char === '|' || char === '<' || char === '>') {
      output.push({ type: 'operator', value: char, start: i - char.length, end: i });
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      inString = true;
      stringChar = char;
      if (stringChar == '`') {
        output.push({ type: 'string', char: stringChar, parts: [], start: i, end: i });
      }
      continue;
    }

    if (char == ' ' || char == '\n' || char == '\t') {
      if (command) {
        output.push({ type: 'part', value: command, start: i - command.length, end: i });
        command = '';
      }
      continue;
    }

    command += char;
  }

  if (command) {
    output.push({
      type: 'part',
      value: command,
      start: code.length - command.length,
      end: code.length
    });
  }

  return output;
};
