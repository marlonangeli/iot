import {useState} from 'react';
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {DeviceType, DeviceTypeEnum} from "@/lib/types";

interface DeviceSearchFilterProps {
  onSearchChange: (term: string) => void;
  onFilterChange: (type: DeviceType | '') => void;
  onAddDevice: () => void;
}

export function DeviceSearchFilter({
                                     onSearchChange,
                                     onFilterChange,
                                     onAddDevice
                                   }: DeviceSearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<DeviceType | ''>('');

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange(value);
  };

  const handleFilterChange = (value: DeviceType | '') => {
    setFilterType(value);
    onFilterChange(value);
  };

  return (
    <div className="flex space-x-2">
      <Input
        placeholder="Buscar dispositivos..."
        value={searchTerm}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="max-w-sm"
      />
      <Select value={filterType} onValueChange={handleFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por tipo"/>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos os tipos</SelectItem>
          {Object.values(DeviceTypeEnum.enum).map((type) => (
            <SelectItem key={type} value={type}>{type}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={onAddDevice}>
        Adicionar
      </Button>
    </div>
  );
}
