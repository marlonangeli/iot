import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Vehicle} from "@/lib/types";

interface VehicleTableProps {
  vehicles: Vehicle[];
  onEditVehicle: (vehicle: Vehicle) => void;
}

export function VehicleTable({vehicles, onEditVehicle}: VehicleTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Placa</TableHead>
            <TableHead>Dispositivo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.id}>
              <TableCell>{vehicle.name}</TableCell>
              <TableCell>{vehicle.plate}</TableCell>
              <TableCell>{vehicle.device?.name || 'Nenhum'}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditVehicle(vehicle)}
                >
                  Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
