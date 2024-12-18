import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Vehicle} from "@/lib/types";

interface VehicleTableProps {
  vehicles: Vehicle[];
  onEditVehicle: (vehicle: Vehicle) => void;
}

export function VehicleTable({vehicles, onEditVehicle}: VehicleTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Plate</TableHead>
          <TableHead>Device</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vehicles.map((vehicle) => (
          <TableRow key={vehicle.id}>
            <TableCell>{vehicle.name}</TableCell>
            <TableCell>{vehicle.plate}</TableCell>
            <TableCell>{vehicle.device?.name || 'No Device'}</TableCell>
            <TableCell>
              <Button onClick={() => onEditVehicle(vehicle)}>
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
