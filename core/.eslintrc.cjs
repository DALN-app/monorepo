module.exports = {
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports,
    ecmaFeatures: {
      jsx: false, // Allows for the parsing of JSX
    },
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    projectFolderIgnoreList: [
      "node_modules",
      "dist",
      "build",
      ".yarn",
      "build-utils",
    ],
    extraFileExtensions: [".sol"],
  },
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "standard-kit/prettier/typescript",
    "standard-kit/prettier/node",
    "plugin:mocha/recommended",
  ],
  plugins: ["prettier", "@typescript-eslint", "unused-imports"],
  rules: {
    "prettier/prettier": [
      "warn",
      {
        endOfLine: "auto",
      },
    ],
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-empty-function": "warn",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "unused-imports/no-unused-imports-ts": "warn",
    "unused-imports/no-unused-vars-ts": [
      "error",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/no-use-before-define": ["error"],
    "@typescript-eslint/no-unsafe-member-access": 0,
    "@typescript-eslint/no-unsafe-assignment": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/no-unsafe-call": "warn",
    "@typescript-eslint/unbound-method": 0,
    "@typescript-eslint/restrict-template-expressions": 0,
    "prefer-destructuring": "off",
    "no-param-reassign": "error",
    "import/order": [
      "warn",
      {
        alphabetize: {
          order:
            "asc" /* sort in ascending order. Options: ['ignore', 'asc', 'desc'] */,
          caseInsensitive: true /* ignore case. Options: [true, false] */,
        },
        "newlines-between": "always",
      },
    ],
    "no-duplicate-imports": "warn",
    "import/named": "off",
    "import/namespace": "off",
    "import/default": "off",
    "import/no-named-as-default-member": "error",
    "import/extensions": "off",
    "import/no-unresolved": "off",
    "import/prefer-default-export": "off",
    "import/no-unused-modules": ["off"],
    "import/no-unassigned-import": "off",
    "import/no-extraneous-dependencies": [
      "warn",
      {
        devDependencies: true,
        optionalDependencies: false,
        peerDependencies: false,
      },
    ],
    "sort-keys": "off",
    "comma-dangle": "off",
    "@typescript-eslint/comma-dangle": ["off"],
    "no-use-before-define": "off",
    "spaced-comment": "warn",
    "max-len": "off",
    indent: "off",
    "no-console": "off",
    "arrow-body-style": "off",
    "no-multiple-empty-lines": "warn",
    "no-restricted-globals": "off",
    "eslint linebreak-style": "off",
    "object-curly-newline": "off",
    "no-shadow": "off",
    "no-void": ["error", { allowAsStatement: true }],
    "mocha/no-mocha-arrows": "off",
    "mocha/no-hooks-for-single-case": "off",
    "mocha/max-top-level-suites": ["warn", { limit: 3 }],
  },
  overrides: [
    {
      files: ["*.test.ts", "*.test.tsx"],
      rules: {
        "@typescript-eslint/no-non-null-assertion": "off",
      },
    },
  ],
  settings: {},
};