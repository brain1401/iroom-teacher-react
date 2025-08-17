import { tanstackConfig } from "@tanstack/eslint-config";
import reactPlugin from "eslint-plugin-react";

export default [
  ...tanstackConfig,
  {
    rules: {
      "@typescript-eslint/array-type": "off",
      "sort-imports": "off",
      "import/order": "off",
    },
  },
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: {
      react: reactPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/prefer-stateless-function": [
        "error",
        { ignorePureComponents: false },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "ClassDeclaration[superClass.name='Component']",
          message: "React 클래스 컴포넌트 금지. 함수 컴포넌트 사용",
        },
        {
          selector: "ClassDeclaration[superClass.name='PureComponent']",
          message: "React 클래스 컴포넌트 금지. 함수 컴포넌트 사용",
        },
        {
          selector: "ClassDeclaration[superClass.property.name='Component']",
          message: "React 클래스 컴포넌트 금지. 함수 컴포넌트 사용",
        },
        {
          selector:
            "ClassDeclaration[superClass.property.name='PureComponent']",
          message: "React 클래스 컴포넌트 금지. 함수 컴포넌트 사용",
        },
      ],
    },
  },
];
