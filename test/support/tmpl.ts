// deno-lint-ignore-file no-explicit-any
const variableRegExp = /\$([0-9a-zA-Z\.]+)/g;

function generateVariableLookup(data: any) {
  return function variableLookup(str: string, path: string) {
    const parts = path.split(".");
    let value = data;

    for (let i = 0; i < parts.length; i++) {
      value = value[parts[i]];
    }

    return value;
  };
}

export async function tmpl(
  fileName: string,
  options: any,
) {
  const str = await Deno.readTextFile(fileName);

  try {
    return str.replace(variableRegExp, generateVariableLookup(options));
  } catch (e) {
    e.name = "RenderError";
    throw e;
  }
}
