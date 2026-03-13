export type Modalidade = {
  codigo: string;
  nome: string;
};

export const MODALIDADE_OPTIONS: Modalidade[] = [
  { codigo: "6", nome: "Pregão Eletrônico" },
  { codigo: "7", nome: "Pregão Presencial" },
  { codigo: "8", nome: "Dispensa" },
];

export function getModalidadeNomeByCodigo(codigo: string | number | null | undefined): string {
  if (codigo == null) return "Não informado";
  const normalized = String(codigo);
  return (
    MODALIDADE_OPTIONS.find((modalidade) => modalidade.codigo === normalized)?.nome ??
    "Não informado"
  );
}
