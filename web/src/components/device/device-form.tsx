import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Device, DeviceSchema, DeviceTypeEnum, DeviceStatusEnum } from "@/lib/types";
import { z } from "zod";

// Form schema for create/update
const FormSchema = DeviceSchema.omit({ id: true, location: true, lastTracking: true });
type FormData = z.infer<typeof FormSchema>;

interface DeviceFormProps {
  initialData?: Partial<Device>;
  onSubmit: (data: FormData) => void;
  onDelete?: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

export function DeviceForm({
                             initialData,
                             onSubmit,
                             onDelete,
                             isLoading = false,
                             mode = 'create'
                           }: DeviceFormProps) {
  // Create form with zod resolver
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type,
      status: initialData?.status,
    }
  });

  const handleSubmit = (data: FormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Device Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Device Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter device name" {...field} />
              </FormControl>
              <FormDescription>Enter a unique name for the device.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Device Type Field */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Device Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select device type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(DeviceTypeEnum.enum).map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Choose the type of device you are adding.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Device Status Field */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Device Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select device status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(DeviceStatusEnum.enum).map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Set the current status of the device.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button
            type="submit"
            disabled={isLoading}
          >
            {mode === 'create'
              ? (isLoading ? 'Creating...' : 'Create Device')
              : (isLoading ? 'Updating...' : 'Update Device')
            }
          </Button>
          {mode === 'edit' && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={isLoading}
            >
              Delete Device
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
