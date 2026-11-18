import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // As fotos já são otimizadas no envio (WEBP 2000px + miniatura) e servidas pelo Supabase,
    // então <img> é intencional e evita custo extra de otimização na Vercel.
    rules: { "@next/next/no-img-element": "off" },
  },
  { ignores: [".next/**", "node_modules/**", "storage/**", "next-env.d.ts", ".agents/**", ".claude/**"] },
];

export default eslintConfig;
