'use client'

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EventFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterType: string;
  setFilterType: (value: string) => void;
}

export function EventFilter({ searchTerm, setSearchTerm, filterType, setFilterType }: EventFilterProps) {
  return (
    <div className="flex space-x-2">
      <Input
        placeholder="Pesquisar eventos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <Select value={filterType} onValueChange={setFilterType}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          <SelectItem value="info">Informação</SelectItem>
          <SelectItem value="alert">Aviso</SelectItem>
          <SelectItem value="error">Erro</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
