import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Device } from "@/lib/types";

interface DeviceTableProps {
  devices: Device[];
  onEditDevice: (device: Device) => void;
}

export function DeviceTable({ devices, onEditDevice }: DeviceTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {devices.map((device) => (
          <TableRow key={device.id}>
            <TableCell>{device.name}</TableCell>
            <TableCell>{device.type}</TableCell>
            <TableCell>{device.status}</TableCell>
            <TableCell>
              <Button onClick={() => onEditDevice(device)}>
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
