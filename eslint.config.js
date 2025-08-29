import { tanstackConfig } from "@tanstack/eslint-config";
import reactPlugin from "eslint-plugin-react";
import typescriptEslint from "@typescript-eslint/eslint-plugin";

export default [
  ...tanstackConfig,

  // 🎯 전역 규칙 재정의 - 코드 품질 강화
  {
    rules: {
      "@typescript-eslint/array-type": "off",
      "sort-imports": "off",
      "import/order": "off",
      "pnpm/json-enforce-catalog": "off", // Disable pnpm rule for Bun projects

      // 📌 기본 코드 품질 강화
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",

      // 🔒 코드 품질 및 일관성
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": ["error", "always"],
      "prefer-template": "error",
    },
  },

  // 🎯 TypeScript 전용 강화 규칙
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },
    rules: {
      // 📋 타입 안전성 극대화

      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/prefer-readonly-parameter-types": "off", // 너무 엄격할 수 있음
      "@typescript-eslint/no-non-null-assertion": "warn",

      // 🏗️ 타입 정의 일관성
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/method-signature-style": ["error", "property"],

      // 📝 네이밍 규칙
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "typeAlias",
          format: ["PascalCase"],
        },
        {
          selector: "variable",
          modifiers: ["const"],
          types: ["function"],
          format: ["camelCase", "PascalCase"],
        },
      ],
    },
  },

  // 🗂️ Ignore 설정
  {
    ignores: [
      "public/**/*",
      ".output/**/*",
      "dist/**/*",
      "node_modules/**/*",
      "**/*.gen.ts", // 자동 생성 파일
      "src/routeTree.gen.ts", // TanStack Router 자동 생성
    ],
  },

  // ⚛️ React/JSX 전용 강화 규칙
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
      // 🏗️ React 19 현대적 패턴 강제
      "react/prefer-stateless-function": [
        "error",
        { ignorePureComponents: false },
      ],
      "react/function-component-definition": [
        "error",
        {
          namedComponents: ["function-declaration", "function-expression"],
          unnamedComponents: "arrow-function",
        },
      ],
      "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],
      "react/jsx-curly-brace-presence": [
        "error",
        { props: "never", children: "never" },
      ],

      // 🎣 Hooks 최적화 규칙
      "react/hook-use-state": ["error", { allowDestructuredState: true }],
      // exhaustive-deps 규칙은 별도 플러그인 필요 (react-hooks/exhaustive-deps)

      // 🚫 안티패턴 금지
      "react/no-array-index-key": "error",
      "react/no-object-type-as-default-prop": "error",
      "react/no-unstable-nested-components": ["error", { allowAsProps: true }],
      "@typescript-eslint/no-unnecessary-condition": "off",
      "no-shadow": "off",

      // 📝 Props 및 컴포넌트 네이밍
      "react/boolean-prop-naming": [
        "error",
        {
          rule: "^(is|has|should|can|will)[A-Z]([A-Za-z0-9]?)+",
          message: "Boolean props는 is|has|should|can|will 접두사를 사용하세요",
        },
      ],

      // ⚡ 성능 최적화
      "react/jsx-no-bind": [
        "error",
        {
          allowArrowFunctions: false,
          allowBind: false,
          allowFunctions: false,
          ignoreRefs: false,
          ignoreDOMComponents: true,
        },
      ],

      // 🚨 클래스 컴포넌트 완전 금지
      "no-restricted-syntax": [
        "error",
        {
          selector: "ClassDeclaration[superClass.name='Component']",
          message: "❌ React 클래스 컴포넌트 금지. 함수 컴포넌트 사용 필수",
        },
        {
          selector: "ClassDeclaration[superClass.name='PureComponent']",
          message: "❌ React 클래스 컴포넌트 금지. 함수 컴포넌트 사용 필수",
        },
        {
          selector: "ClassDeclaration[superClass.property.name='Component']",
          message: "❌ React 클래스 컴포넌트 금지. 함수 컴포넌트 사용 필수",
        },
        {
          selector:
            "ClassDeclaration[superClass.property.name='PureComponent']",
          message: "❌ React 클래스 컴포넌트 금지. 함수 컴포넌트 사용 필수",
        },
        // 🧠 Jotai 패턴 강제
        {
          selector:
            "VariableDeclarator[id.name=/.*atom$/i]:not([init.callee.name=/^atom/i])",
          message: "🧠 Atom 변수는 반드시 atom() 함수로 생성해야 합니다",
        },
        // 📁 Import 패턴 강제
        {
          selector: "ImportDeclaration[source.value=/^../]",
          message:
            "📁 상대경로 대신 '@/' 절대경로를 사용하세요 (예: '@/components/Button')",
        },
        // 🎯 Interface 대신 Type 사용 강제
        {
          selector: "TSInterfaceDeclaration",
          message: "🎯 interface 대신 type을 사용하세요 (프로젝트 컨벤션)",
        },
      ],

      "no-restricted-syntax": [
        "warn",
        // ⚡ 성능 안티패턴 금지
        {
          selector:
            "JSXAttribute[name.name='style'][value.type='ObjectExpression']",
          message:
            "⚡ 인라인 스타일 객체는 성능에 악영향. CSS 클래스나 cn() 함수 사용",
        },
      ],
    },
  },

  // 🗃️ Atoms/상태 관리 파일 전용 규칙
  {
    files: ["**/atoms/**/*.{ts,tsx}", "**/*.atom.{ts,tsx}"],
    rules: {
      // 🧠 Jotai 네이밍 규칙
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variable",
          types: ["function"],
          filter: { regex: "atom$", match: true },
          format: ["camelCase"],
          suffix: ["Atom"],
        },
      ],
      // 📚 Atom 문서화는 수동으로 관리 (require-jsdoc 규칙은 ESLint 9에서 제거됨)
    },
  },

  // 📁 Components 디렉토리 전용 규칙
  {
    files: ["**/components/**/*.{tsx,jsx}"],
    rules: {
      // 📂 컴포넌트 네이밍
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "function",
          format: ["PascalCase"],
        },
      ],
      // 📝 컴포넌트 export 규칙
      "import/no-default-export": "error",
    },
  },

  // 📁 커스텀 훅 전용 규칙
  {
    files: ["**/components/**/use*.{tsx,jsx}"],
    rules: {
      // 📂 컴포넌트 네이밍
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "function",
          format: ["camelCase"],
        },
      ],
      // 📝 컴포넌트 export 규칙
      "import/no-default-export": "error",
    },
  },

  // 덮어쓸 규칙
  {
    rules: {
      "@typescript-eslint/no-unnecessary-condition": "off",
      "no-shadow": "off",
      "react/jsx-no-bind": "off",
    },
  },
];
