import { X, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LicitacaoFilterData } from "../../models/LicitacaoFilterData";
import { useEffect, useMemo, useState } from "react";
import { Portal } from "../../types/BuscaLicitacoes/Portal";
import { useEstados } from "../hooks/useEstados";
import { useCidades } from "../hooks/useCidades";
import { useModalidades } from "../hooks/useModalidades";

export type AdvancedSearchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idPrefix: string;
  portais: Portal[];
  filterData: LicitacaoFilterData;
  setFilterData: React.Dispatch<React.SetStateAction<LicitacaoFilterData>>;
  onSubmit?: () => void;
};

export function AdvancedSearchDialog({
  open,
  onOpenChange,
  idPrefix,
  portais,
  filterData,
  setFilterData,
  onSubmit,
}: AdvancedSearchDialogProps) {
  const { estados } = useEstados();
  const { cidades } = useCidades(filterData.StateCodes);
  const { modalidades } = useModalidades();
  const [estadoSearchQuery, setEstadoSearchQuery] = useState("");
  const [cidadeSearchQuery, setCidadeSearchQuery] = useState("");
  const hasSelectedStates = filterData.StateCodes.length > 0;

  const filteredEstados = useMemo(() => {
    const query = estadoSearchQuery.trim().toLowerCase();
    if (!query) return estados;
    return estados.filter(
      (estado) =>
        estado.nome.toLowerCase().includes(query) ||
        estado.codigo.toLowerCase().includes(query),
    );
  }, [estados, estadoSearchQuery]);

  const filteredCidades = useMemo(() => {
    const query = cidadeSearchQuery.trim().toLowerCase();
    if (!query) return cidades;
    return cidades.filter((cidade) => cidade.nome.toLowerCase().includes(query));
  }, [cidades, cidadeSearchQuery]);

  // Local UI state for input fields
  const [currentIncludeInput, setCurrentIncludeInput] = useState("");
  const [currentExcludeInput, setCurrentExcludeInput] = useState("");

  const isCustomOpeningDate = filterData.OpeningDateFilter === "custom-period";

  // Helper to convert filter dates to DateRange for the calendar
  const dateRange: DateRange | undefined =
    isCustomOpeningDate && (filterData.OpeningDateStart || filterData.OpeningDateEnd)
      ? {
          from: filterData.OpeningDateStart,
          to: filterData.OpeningDateEnd,
        }
      : undefined;

  const handleAddIncludeKeyword = () => {
    if (
      currentIncludeInput.trim() &&
      !filterData.IncludeKeywords.includes(currentIncludeInput.trim())
    ) {
      setFilterData({
        ...filterData,
        IncludeKeywords: [...filterData.IncludeKeywords, currentIncludeInput.trim()],
      });
      setCurrentIncludeInput("");
    }
  };

  const handleRemoveIncludeKeyword = (index: number) => {
    setFilterData({
      ...filterData,
      IncludeKeywords: filterData.IncludeKeywords.filter((_, i) => i !== index),
    });
  };

  const handleAddExcludeKeyword = () => {
    if (
      currentExcludeInput.trim() &&
      !filterData.ExcludeKeywords.includes(currentExcludeInput.trim())
    ) {
      setFilterData({
        ...filterData,
        ExcludeKeywords: [...filterData.ExcludeKeywords, currentExcludeInput.trim()],
      });
      setCurrentExcludeInput("");
    }
  };

  const handleRemoveExcludeKeyword = (index: number) => {
    setFilterData({
      ...filterData,
      ExcludeKeywords: filterData.ExcludeKeywords.filter((_, i) => i !== index),
    });
  };

  const togglePortal = (portalId: string) => {
    const alreadySelected = filterData.Portals.some((p) => p.id === portalId);
    if (alreadySelected) {
      setFilterData({
        ...filterData,
        Portals: filterData.Portals.filter((p) => p.id !== portalId),
      });
      return;
    }

    const portalToAdd = portais.find((p) => p.id === portalId) ?? {
      id: portalId,
      nome: portalId,
    };

    setFilterData({
      ...filterData,
      Portals: [...filterData.Portals, portalToAdd],
    });
  };

  const toggleGovernmentLevel = (value: string) => {
    if (filterData.GovernmentLevels.includes(value)) {
      setFilterData({
        ...filterData,
        GovernmentLevels: filterData.GovernmentLevels.filter((g) => g !== value),
      });
    } else {
      setFilterData({
        ...filterData,
        GovernmentLevels: [...filterData.GovernmentLevels, value],
      });
    }
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setFilterData((prev) => ({
      ...prev,
      OpeningDateFilter: "custom-period",
      OpeningDateStart: range?.from,
      OpeningDateEnd: range?.to,
    }));
  };

  const toggleStateCode = (codigo: string) => {
    setFilterData((prev) => {
      const alreadySelected = prev.StateCodes.includes(codigo);
      const nextStateCodes = alreadySelected
        ? prev.StateCodes.filter((c) => c !== codigo)
        : [...prev.StateCodes, codigo];

      return {
        ...prev,
        StateCodes: nextStateCodes,
      };
    });
  };

  const toggleCityId = (cidadeId: string) => {
    setFilterData((prev) => {
      const alreadySelected = prev.CityIds.includes(cidadeId);
      return {
        ...prev,
        CityIds: alreadySelected
          ? prev.CityIds.filter((id) => id !== cidadeId)
          : [...prev.CityIds, cidadeId],
      };
    });
  };

  useEffect(() => {
    setFilterData((prev) => {
      const availableCityIds = new Set(cidades.map((c) => c.id));
      const nextCityIds = prev.CityIds.filter((id) => availableCityIds.has(id));
      if (nextCityIds.length === prev.CityIds.length) return prev;
      return {
        ...prev,
        CityIds: nextCityIds,
      };
    });
  }, [cidades, setFilterData]);

  useEffect(() => {
    if (hasSelectedStates) return;
    setCidadeSearchQuery("");
  }, [hasSelectedStates]);

  useEffect(() => {
    setFilterData((prev) => {
      if (!prev.ModalityId) return prev;
      const exists = modalidades.some((m) => m.nome === prev.ModalityId);
      if (exists) return prev;
      return { ...prev, ModalityId: undefined };
    });
  }, [modalidades, setFilterData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-w-[90vw] max-h-[85vh] overflow-y-auto bg-white dark:bg-[#0A0A0A] border-[#E6E8EC] dark:border-[#1F1F1F]">
        <DialogHeader>
          <DialogTitle className="text-[#111827] dark:text-[#F7F8FA]">
            Busca Avançada
          </DialogTitle>
          <DialogDescription className="text-[#6B7280] dark:text-[#9CA3AF]">
            Configure filtros avançados para refinar sua busca.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Include Keywords */}
          <div className="space-y-3">
            <Label className="text-sm text-[#111827] dark:text-[#F7F8FA]">
              Incluir palavras-chave
            </Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Digite uma palavra-chave"
                value={currentIncludeInput}
                onChange={(e) => setCurrentIncludeInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddIncludeKeyword()}
                className="flex-1 bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F] text-[#111827] dark:text-[#F7F8FA]"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddIncludeKeyword}
                className="bg-[#2563EB] hover:bg-[#1E40AF] dark:bg-[#1E3A8A] dark:hover:bg-[#1E3A8A]/80 text-white"
              >
                Adicionar
              </Button>
            </div>
            {filterData.IncludeKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filterData.IncludeKeywords.map((keyword, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-[#F7F8FA] dark:bg-[#1F1F1F] rounded-md border border-[#E6E8EC] dark:border-[#2A2A2A]"
                  >
                    <span className="text-sm text-[#111827] dark:text-[#F7F8FA]">
                      {keyword}
                    </span>
                    <button
                      onClick={() => handleRemoveIncludeKeyword(index)}
                      className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F7F8FA]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Exclude Keywords */}
          <div className="space-y-3">
            <Label className="text-sm text-[#111827] dark:text-[#F7F8FA]">
              Excluir palavras-chave
            </Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Digite uma palavra-chave"
                value={currentExcludeInput}
                onChange={(e) => setCurrentExcludeInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddExcludeKeyword()}
                className="flex-1 bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F] text-[#111827] dark:text-[#F7F8FA]"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddExcludeKeyword}
                className="bg-[#2563EB] hover:bg-[#1E40AF] dark:bg-[#1E3A8A] dark:hover:bg-[#1E3A8A]/80 text-white"
              >
                Adicionar
              </Button>
            </div>
            {filterData.ExcludeKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filterData.ExcludeKeywords.map((keyword, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-[#FEF2F2] dark:bg-[#2A1F1F] rounded-md border border-[#FCA5A5] dark:border-[#7F1D1D]"
                  >
                    <span className="text-sm text-[#991B1B] dark:text-[#FCA5A5]">
                      {keyword}
                    </span>
                    <button
                      onClick={() => handleRemoveExcludeKeyword(index)}
                      className="text-[#991B1B] dark:text-[#FCA5A5] hover:text-[#7F1D1D] dark:hover:text-[#F87171]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-[#E6E8EC] dark:border-[#1F1F1F]"></div>

          {/* Data de Abertura */}
          <div className="space-y-3">
            <Label className="text-sm text-[#111827] dark:text-[#F7F8FA]">
              Data de abertura
            </Label>
            <Select
              value={filterData.OpeningDateFilter}
              onValueChange={(value) => {
                if (value === "custom-period") {
                  setFilterData((prev) => ({
                    ...prev,
                    OpeningDateFilter: "custom-period",
                  }));
                  return;
                }

                setFilterData((prev) => ({
                  ...prev,
                  OpeningDateFilter: value as LicitacaoFilterData["OpeningDateFilter"],
                  OpeningDateStart: undefined,
                  OpeningDateEnd: undefined,
                }));
              }}
            >
              <SelectTrigger className="bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">
                  Qualquer data
                </SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="current-week">
                  Esta semana
                </SelectItem>
                <SelectItem value="current-month">Este mês</SelectItem>
                <SelectItem value="custom-period">
                  Período personalizado
                </SelectItem>
              </SelectContent>
            </Select>
            {isCustomOpeningDate && (
              <div className="mt-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between text-left font-normal bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F] hover:bg-[#F7F8FA] dark:hover:bg-[#1F1F1F]"
                    >
                      <span className="text-sm text-[#111827] dark:text-[#F7F8FA] truncate">
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                              {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                            </>
                          ) : (
                            format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                          )
                        ) : (
                          "Selecione um período"
                        )}
                      </span>
                      <ChevronDown className="h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF] shrink-0 ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[280px] p-3 bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F]"
                    align="start"
                  >
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={handleDateRangeChange}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          {/* Modalidade */}
          <div className="space-y-3">
            <Label className="text-sm text-[#111827] dark:text-[#F7F8FA]">
              Modalidade
            </Label>
            <Select
              value={filterData.ModalityId}
              onValueChange={(value) => {
                setFilterData({
                  ...filterData,
                  ModalityId: value,
                });
              }}
            >
              <SelectTrigger className="bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F]">
                <SelectValue placeholder="Selecione uma modalidade" />
              </SelectTrigger>
              <SelectContent>
                {modalidades.map((m) => (
                  <SelectItem key={m.nome} value={m.nome}>
                    {m.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estado */}
          <div className="space-y-3">
            <Label className="text-sm text-[#111827] dark:text-[#F7F8FA]">
              Estado
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-left font-normal bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F] hover:bg-[#F7F8FA] dark:hover:bg-[#1F1F1F]"
                >
                  <span className="text-sm text-[#111827] dark:text-[#F7F8FA] truncate">
                    {filterData.StateCodes.length === 0
                      ? 'Selecione os estados'
                      : estados.length > 0 && filterData.StateCodes.length === estados.length
                      ? 'Todos os estados'
                      : `${filterData.StateCodes.length} selecionado${filterData.StateCodes.length > 1 ? 's' : ''}`}
                  </span>
                  <ChevronDown className="h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF] shrink-0 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[280px] p-3 bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F]"
                align="start"
              >
                <div className="space-y-3">
                  <Input
                    type="text"
                    placeholder="Filtrar estados..."
                    value={estadoSearchQuery}
                    onChange={(e) => setEstadoSearchQuery(e.target.value)}
                    className="bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F] text-[#111827] dark:text-[#F7F8FA]"
                  />
                  {filteredEstados.map((estado) => (
                    <div key={estado.codigo} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${idPrefix}-estado-${estado.codigo}`}
                        checked={filterData.StateCodes.includes(estado.codigo)}
                        onCheckedChange={() => toggleStateCode(estado.codigo)}
                      />
                      <label
                        htmlFor={`${idPrefix}-estado-${estado.codigo}`}
                        className="text-sm text-[#111827] dark:text-[#F7F8FA] cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {estado.nome}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Cidade */}
          <div className="space-y-3">
            <Label className="text-sm text-[#111827] dark:text-[#F7F8FA]">
              Cidade
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={!hasSelectedStates}
                  className="w-full justify-between text-left font-normal bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F] hover:bg-[#F7F8FA] dark:hover:bg-[#1F1F1F] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="text-sm text-[#111827] dark:text-[#F7F8FA] truncate">
                    {!hasSelectedStates
                      ? "Selecione ao menos um estado"
                      : filterData.CityIds.length === 0
                      ? 'Selecione as cidades'
                      : cidades.length > 0 && filterData.CityIds.length === cidades.length
                      ? 'Todas as cidades'
                      : `${filterData.CityIds.length} selecionada${filterData.CityIds.length > 1 ? 's' : ''}`}
                  </span>
                  <ChevronDown className="h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF] shrink-0 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[280px] p-3 bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F]"
                align="start"
              >
                <div className="space-y-3">
                  {!hasSelectedStates ? (
                    <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      Selecione pelo menos um estado para habilitar cidades.
                    </p>
                  ) : (
                    <>
                      <Input
                        type="text"
                        placeholder="Filtrar cidades..."
                        value={cidadeSearchQuery}
                        onChange={(e) => setCidadeSearchQuery(e.target.value)}
                        className="bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F] text-[#111827] dark:text-[#F7F8FA]"
                      />
                      {filteredCidades.map((cidade) => (
                        <div key={cidade.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${idPrefix}-cidade-${cidade.id}`}
                            checked={filterData.CityIds.includes(cidade.id)}
                            onCheckedChange={() => toggleCityId(cidade.id)}
                          />
                          <label
                            htmlFor={`${idPrefix}-cidade-${cidade.id}`}
                            className="text-sm text-[#111827] dark:text-[#F7F8FA] cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {cidade.nome}
                          </label>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Esfera */}
          <div className="space-y-3">
            <Label className="text-sm text-[#111827] dark:text-[#F7F8FA]">
              Esfera
            </Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${idPrefix}-modal-municipal`}
                  checked={filterData.GovernmentLevels.includes("municipal")}
                  onCheckedChange={() => toggleGovernmentLevel("municipal")}
                />
                <label
                  htmlFor={`${idPrefix}-modal-municipal`}
                  className="text-sm text-[#111827] dark:text-[#F7F8FA] cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Municipal
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${idPrefix}-modal-estadual`}
                  checked={filterData.GovernmentLevels.includes("estadual")}
                  onCheckedChange={() => toggleGovernmentLevel("estadual")}
                />
                <label
                  htmlFor={`${idPrefix}-modal-estadual`}
                  className="text-sm text-[#111827] dark:text-[#F7F8FA] cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Estadual
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${idPrefix}-modal-federal`}
                  checked={filterData.GovernmentLevels.includes("federal")}
                  onCheckedChange={() => toggleGovernmentLevel("federal")}
                />
                <label
                  htmlFor={`${idPrefix}-modal-federal`}
                  className="text-sm text-[#111827] dark:text-[#F7F8FA] cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Federal
                </label>
              </div>
            </div>
          </div>

          {/* Portais */}
          <div className="space-y-3">
            <Label className="text-sm text-[#111827] dark:text-[#F7F8FA]">
              Portais
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-left font-normal bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F] hover:bg-[#F7F8FA] dark:hover:bg-[#1F1F1F]"
                >
                  <span className="text-sm text-[#111827] dark:text-[#F7F8FA] truncate">
                    {filterData.Portals.length === 0
                      ? "Selecione os portais"
                      : filterData.Portals.length ===
                          portais.length
                        ? "Todos os portais"
                        : `${filterData.Portals.length} selecionado${filterData.Portals.length > 1 ? "s" : ""}`}
                  </span>
                  <ChevronDown className="h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF] shrink-0 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[280px] p-3 bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F]"
                align="start"
              >
                <div className="space-y-3">
                  {portais.map((portal) => (
                    <div
                      key={portal.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`${idPrefix}-modal-portal-${portal.id}`}
                        checked={filterData.Portals.some((p) => p.id === portal.id)}
                        onCheckedChange={() => togglePortal(portal.id)}
                      />
                      <label
                        htmlFor={`${idPrefix}-modal-portal-${portal.id}`}
                        className="text-sm text-[#111827] dark:text-[#F7F8FA] cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {portal.nome}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F] text-[#111827] dark:text-[#F7F8FA] hover:bg-[#F7F8FA] dark:hover:bg-[#1F1F1F]"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onSubmit?.();
              onOpenChange(false);
            }}
            className="bg-[#2563EB] hover:bg-[#1E40AF] dark:bg-[#1E3A8A] dark:hover:bg-[#1E3A8A]/80 text-white"
          >
            Buscar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
