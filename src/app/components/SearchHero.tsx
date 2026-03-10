import { useState } from "react";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import {
  Search,
  CalendarIcon,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Checkbox } from "../components/ui/checkbox";
import { AdvancedSearchDialog } from "../components/AdvancedSearchDialog";

const PORTAIS = [
  { value: "comprasnet", label: "ComprasNet" },
  { value: "bec", label: "BEC (Bolsa Eletrônica de Compras)" },
  { value: "licitacoes-e", label: "Licitações-e" },
  { value: "bbmnet", label: "BBMNet" },
];

export function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<
    DateRange | undefined
  >();
  const [dateFilterType, setDateFilterType] = useState<
    "preset" | "custom"
  >("preset");
  const [modalDateRange, setModalDateRange] = useState<DateRange | undefined>();
  const [modalDateFilterType, setModalDateFilterType] = useState<"preset" | "custom">("preset");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedPortais, setSelectedPortais] = useState<
    string[]
  >([]);
  const [advancedSearchOpen, setAdvancedSearchOpen] =
    useState(false);
  const [currentIncludeInput, setCurrentIncludeInput] =
    useState("");
  const [includeKeywords, setIncludeKeywords] = useState<
    string[]
  >([]);
  const [currentExcludeInput, setCurrentExcludeInput] =
    useState("");
  const [excludeKeywords, setExcludeKeywords] = useState<
    string[]
  >([]);

  const handleSearch = () => {
    navigate("/resultados");
  };

  const handleFilterOpen = () => {
    setIsFilterOpen(true);
  };

  const handleFilterClose = () => {
    setIsFilterOpen(false);
  };

  const handlePortalChange = (value: string) => {
    if (selectedPortais.includes(value)) {
      setSelectedPortais(
        selectedPortais.filter((portal) => portal !== value),
      );
    } else {
      setSelectedPortais([...selectedPortais, value]);
    }
  };

  const addIncludeKeyword = () => {
    if (
      currentIncludeInput.trim() &&
      !includeKeywords.includes(currentIncludeInput)
    ) {
      setIncludeKeywords([
        ...includeKeywords,
        currentIncludeInput,
      ]);
      setCurrentIncludeInput("");
    }
  };

  const removeIncludeKeyword = (index: number) => {
    setIncludeKeywords(
      includeKeywords.filter((_, i) => i !== index),
    );
  };

  const addExcludeKeyword = () => {
    if (
      currentExcludeInput.trim() &&
      !excludeKeywords.includes(currentExcludeInput)
    ) {
      setExcludeKeywords([
        ...excludeKeywords,
        currentExcludeInput,
      ]);
      setCurrentExcludeInput("");
    }
  };

  const removeExcludeKeyword = (index: number) => {
    setExcludeKeywords(
      excludeKeywords.filter((_, i) => i !== index),
    );
  };

  const togglePortal = (value: string) => {
    if (selectedPortais.includes(value)) {
      setSelectedPortais(
        selectedPortais.filter((portal) => portal !== value),
      );
    } else {
      setSelectedPortais([...selectedPortais, value]);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header Navigation */}
      <Header />

      {/* Hero Section */}
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="pt-16 pb-12">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-[40px] font-semibold text-[#111827] dark:text-[#F7F8FA] mb-4 leading-tight">
              Encontre oportunidades de licitação
            </h1>
            <p className="text-lg text-[#6B7280] dark:text-[#9CA3AF]">
              Busque e monitore licitações públicas de forma
              simples e eficiente
            </p>
          </div>

          {/* Search Input */}
          <div className="max-w-3xl mx-auto mb-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9CA3AF] dark:text-[#6B7280]" />
              <input
                type="text"
                placeholder="Buscar por palavras-chave, CNPJ, órgão..."
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#111111] border border-[#E6E8EC] dark:border-[#1F1F1F] rounded-lg text-[15px] text-[#111827] dark:text-[#F7F8FA] placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2563EB] dark:focus:ring-[#1E3A8A] focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleSearch()
                }
              />
            </div>
          </div>

          {/* Advanced Search Link */}
          <div className="max-w-3xl mx-auto mb-8 flex justify-center">
            <button
              onClick={() => setAdvancedSearchOpen(true)}
              className="text-sm text-[#2563EB] dark:text-[#60A5FA] hover:text-[#1D4ED8] dark:hover:text-[#3B82F6] flex items-center gap-1.5"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Busca Avançada
            </button>
          </div>

          {/* Filter Grid */}
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Data de Abertura */}
              <div className="space-y-2">
                <Label className="text-sm text-[#111827] dark:text-[#F7F8FA]">
                  Data de abertura
                </Label>
                <Select
                  defaultValue="any"
                  onValueChange={(value) => {
                    if (value === "custom") {
                      setDateFilterType("custom");
                    } else {
                      setDateFilterType("preset");
                    }
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
                    <SelectItem value="week">
                      Esta semana
                    </SelectItem>
                    <SelectItem value="month">
                      Este mês
                    </SelectItem>
                    <SelectItem value="custom">
                      Período personalizado
                    </SelectItem>
                  </SelectContent>
                </Select>

                {dateFilterType === "custom" && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F] hover:bg-[#F7F8FA] dark:hover:bg-[#1F1F1F]"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(
                                dateRange.from,
                                "dd/MM/yyyy",
                                { locale: ptBR },
                              )}{" "}
                              -{" "}
                              {format(
                                dateRange.to,
                                "dd/MM/yyyy",
                                { locale: ptBR },
                              )}
                            </>
                          ) : (
                            format(
                              dateRange.from,
                              "dd/MM/yyyy",
                              { locale: ptBR },
                            )
                          )
                        ) : (
                          <span className="text-[#9CA3AF] dark:text-[#6B7280]">
                            Selecione o período
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-white dark:bg-[#111111]"
                      align="start"
                    >
                      <Calendar
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              {/* Modalidade */}
              <div className="space-y-2">
                <Label className="text-sm text-[#111827] dark:text-[#F7F8FA]">
                  Modalidade
                </Label>
                <Select>
                  <SelectTrigger className="bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F]">
                    <SelectValue placeholder="Selecione uma modalidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="licitacao">
                      Licitação
                    </SelectItem>
                    <SelectItem value="concurso">
                      Concurso
                    </SelectItem>
                    <SelectItem value="dispensa">
                      Dispensa
                    </SelectItem>
                    <SelectItem value="inexigibilidade">
                      Inexigibilidade
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <Label className="text-sm text-[#111827] dark:text-[#F7F8FA]">
                  Estado
                </Label>
                <Select>
                  <SelectTrigger className="bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F]">
                    <SelectValue placeholder="Selecione um estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sp">
                      São Paulo
                    </SelectItem>
                    <SelectItem value="rj">
                      Rio de Janeiro
                    </SelectItem>
                    <SelectItem value="mg">
                      Minas Gerais
                    </SelectItem>
                    <SelectItem value="all">
                      Todos os estados
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cidade */}
              <div className="space-y-2">
                <Label className="text-sm text-[#111827] dark:text-[#F7F8FA]">
                  Cidade
                </Label>
                <Select>
                  <SelectTrigger className="bg-white dark:bg-[#111111] border-[#E6E8EC] dark:border-[#1F1F1F]">
                    <SelectValue placeholder="Selecione uma cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bh">
                      Belo Horizonte
                    </SelectItem>
                    <SelectItem value="sp">
                      São Paulo
                    </SelectItem>
                    <SelectItem value="rj">
                      Rio de Janeiro
                    </SelectItem>
                    <SelectItem value="contagem">
                      Contagem
                    </SelectItem>
                    <SelectItem value="betim">Betim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleSearch}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 py-2.5 rounded-lg"
              >
                Buscar oportunidades
              </Button>
            </div>
          </div>

          <AdvancedSearchDialog
            open={advancedSearchOpen}
            onOpenChange={setAdvancedSearchOpen}
            idPrefix="home"
            portais={PORTAIS}
            selectedPortais={selectedPortais}
            onTogglePortal={togglePortal}
            currentIncludeInput={currentIncludeInput}
            onCurrentIncludeInputChange={setCurrentIncludeInput}
            includeKeywords={includeKeywords}
            onAddIncludeKeyword={addIncludeKeyword}
            onRemoveIncludeKeyword={removeIncludeKeyword}
            currentExcludeInput={currentExcludeInput}
            onCurrentExcludeInputChange={setCurrentExcludeInput}
            excludeKeywords={excludeKeywords}
            onAddExcludeKeyword={addExcludeKeyword}
            onRemoveExcludeKeyword={removeExcludeKeyword}
            dateFilterType={modalDateFilterType}
            onDateFilterTypeChange={(type) => setModalDateFilterType(type as "preset" | "custom")}
            dateRange={modalDateRange}
            onDateRangeChange={setModalDateRange}
            onSubmit={handleSearch}
          />
        </div>
      </div>

      {/* Filter Dialog */}
      <Dialog
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filtros</DialogTitle>
            <DialogDescription>
              Personalize sua busca com filtros adicionais.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-[#111827] dark:text-[#F7F8FA]">
                Portais
              </Label>
              <div className="space-y-1">
                {PORTAIS.map((portal) => (
                  <Checkbox
                    key={portal.value}
                    value={portal.value}
                    checked={selectedPortais.includes(
                      portal.value,
                    )}
                    onCheckedChange={(checked) =>
                      handlePortalChange(portal.value)
                    }
                  >
                    {portal.label}
                  </Checkbox>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 py-2.5 rounded-lg"
              onClick={handleFilterClose}
            >
              Aplicar filtros
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}