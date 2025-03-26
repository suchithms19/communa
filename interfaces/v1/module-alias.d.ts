declare module 'module-alias' {
  function addAliases(aliases: { [alias: string]: string }): void;
  function addPath(path: string): void;
  export = {
    addAliases,
    addPath
  };
} 