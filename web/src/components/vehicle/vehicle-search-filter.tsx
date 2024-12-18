import {useState} from 'react';
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

interface VehicleSearchFilterProps {
  onSearchChange: (term: string) => void;
  onAddVehicle: () => void;
}

export function VehicleSearchFilter({
                                      onSearchChange,
                                      onAddVehicle
                                    }: VehicleSearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange(value);
  };

  return (
    <div className="flex space-x-2">
      <Input
        placeholder="Search vehicles..."
        value={searchTerm}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="max-w-sm"
      />

      <Button onClick={onAddVehicle}>
        Add Vehicle
      </Button>
    </div>
  );
}
