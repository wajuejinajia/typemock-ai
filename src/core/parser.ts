import { Project, InterfaceDeclaration, PropertySignature, Type } from "ts-morph";

/**
 * 字段 Schema 定义
 */
export interface FieldSchema {
  name: string;
  type: string;
  docs: string;
  isRequired: boolean;
  children?: FieldSchema[];
}

/**
 * Interface Schema 定义
 */
export interface InterfaceSchema {
  name: string;
  docs: string;
  fields: FieldSchema[];
}

/**
 * 从类型中提取嵌套对象的字段信息
 */
function extractNestedFields(type: Type): FieldSchema[] | undefined {
  // 检查是否为对象字面量类型
  if (!type.isObject() || type.isArray()) {
    return undefined;
  }

  const properties = type.getProperties();
  if (properties.length === 0) {
    return undefined;
  }

  // 排除已定义的 interface 引用（如 Address、UserTag）
  const symbol = type.getSymbol() || type.getAliasSymbol();
  if (symbol) {
    const declarations = symbol.getDeclarations();
    if (declarations.some((d) => d.getKindName() === "InterfaceDeclaration")) {
      return undefined;
    }
  }

  return properties.map((prop) => {
    const propType = prop.getValueDeclaration()?.getType();
    const propDecl = prop.getValueDeclaration();

    let docs = "";
    if (propDecl && "getJsDocs" in propDecl) {
      const jsDocs = (propDecl as PropertySignature).getJsDocs();
      docs = jsDocs.map((doc) => doc.getCommentText() || "").join("\n").trim();
    }

    return {
      name: prop.getName(),
      type: propType?.getText() || "unknown",
      docs,
      isRequired: !prop.isOptional(),
      children: propType ? extractNestedFields(propType) : undefined,
    };
  });
}

/**
 * 从 PropertySignature 提取字段信息
 */
function extractFieldSchema(prop: PropertySignature): FieldSchema {
  const name = prop.getName();
  const type = prop.getType();
  const typeText = type.getText(prop);

  // 提取 JSDoc 注释
  const jsDocs = prop.getJsDocs();
  const docs = jsDocs.map((doc) => doc.getCommentText() || "").join("\n").trim();

  // 检查是否必填
  const isRequired = !prop.hasQuestionToken();

  // 处理嵌套对象（内联定义的对象，非引用）
  const children = extractNestedFields(type);

  return {
    name,
    type: typeText,
    docs,
    isRequired,
    children,
  };
}

/**
 * 提取 Interface 的 Schema 信息
 * @param filePath TypeScript 文件路径
 * @param interfaceName 要提取的 Interface 名称
 * @returns Interface Schema 对象
 */
export function extractInterfaceSchema(
  filePath: string,
  interfaceName: string
): InterfaceSchema | null {
  // 创建项目实例
  const project = new Project({
    compilerOptions: {
      strictNullChecks: true,
    },
  });

  // 添加源文件
  const sourceFile = project.addSourceFileAtPath(filePath);

  // 查找目标 Interface
  const interfaceDecl = sourceFile.getInterface(interfaceName);

  if (!interfaceDecl) {
    console.error(`Interface "${interfaceName}" not found in ${filePath}`);
    return null;
  }

  // 提取 Interface 级别的 JSDoc
  const interfaceDocs = interfaceDecl
    .getJsDocs()
    .map((doc) => doc.getCommentText() || "")
    .join("\n")
    .trim();

  // 提取所有属性
  const properties = interfaceDecl.getProperties();
  const fields = properties.map(extractFieldSchema);

  return {
    name: interfaceName,
    docs: interfaceDocs,
    fields,
  };
}

/**
 * 提取文件中所有 Interface 的 Schema
 * @param filePath TypeScript 文件路径
 * @returns 所有 Interface Schema 的数组
 */
export function extractAllInterfaceSchemas(filePath: string): InterfaceSchema[] {
  const project = new Project({
    compilerOptions: {
      strictNullChecks: true,
    },
  });

  const sourceFile = project.addSourceFileAtPath(filePath);
  const interfaces = sourceFile.getInterfaces();

  return interfaces.map((interfaceDecl) => {
    const interfaceDocs = interfaceDecl
      .getJsDocs()
      .map((doc) => doc.getCommentText() || "")
      .join("\n")
      .trim();

    const properties = interfaceDecl.getProperties();
    const fields = properties.map(extractFieldSchema);

    return {
      name: interfaceDecl.getName(),
      docs: interfaceDocs,
      fields,
    };
  });
}
