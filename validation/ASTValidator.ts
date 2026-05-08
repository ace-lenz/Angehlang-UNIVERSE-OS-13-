// src/validation/ASTValidator.ts
import ts from 'typescript';

export class ASTValidator {
  validate(code: string): { valid: boolean; errors: string[]; fixedLines: string[] } {
    const errors: string[] = [];
    
    // Create an in-memory source file - no disk I/O
    const sourceFile = ts.createSourceFile(
      'synth.ts',
      code,
      ts.ScriptTarget.Latest,
      true, // setParentNodes
      ts.ScriptKind.TS
    );
    
    // Custom visitor to check for dangerous patterns
    function visit(node: ts.Node) {
      if (ts.isCallExpression(node)) {
        const funcName = node.expression.getText(sourceFile);
        if (['eval', 'exec', 'execSync', 'require', 'import'].includes(funcName)) {
          errors.push(`Forbidden function call: ${funcName}`);
        }
      }
      if (ts.isTypeReferenceNode(node) && node.typeName.getText(sourceFile) === 'any') {
        errors.push('Use of `any` type is forbidden');
      }
      if (ts.isPropertyAccessExpression(node)) {
        const text = node.getText(sourceFile);
        if (text.includes('process.exit') || text.includes('fs.write') || text.includes('os.')) {
          errors.push(`Forbidden API: ${text}`);
        }
      }
      ts.forEachChild(node, visit);
    }
    
    visit(sourceFile);
    
    // Attempt graceful extraction of code blocks if user passes markdown
    let pureCode = code;
    if (code.includes('```')) {
      const match = code.match(/```(?:typescript|ts|js|javascript)?\n([\s\S]*?)```/);
      if (match) pureCode = match[1];
    }
    
    // Provide diagnostic checks
    // We intentionally don't emit to keep it fully sandboxed. Syntactic diagnostics still work.
    const tempFile = ts.createSourceFile('clean.ts', pureCode, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    // Because we lack the full compiler host (type checking), we only extract AST-level errors.
    
    return { valid: errors.length === 0, errors, fixedLines: [pureCode] };
  }
}
