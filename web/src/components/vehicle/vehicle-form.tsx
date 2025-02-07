import {Vehicle} from "@/lib/types";
import {CreateVehicle, CreateVehicleSchema} from "@/lib/clients/logi.types";
import {useDevices} from "@/lib/store/device-store";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

interface VehicleFormProps {
  initialData?: Vehicle;
  onSubmit?: (data: CreateVehicle) => void;
  onUpdate?: (data: Partial<Vehicle>) => void;
  onDelete?: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

export function VehicleForm({
                              initialData,
                              onSubmit,
                              onUpdate,
                              onDelete,
                              isLoading = false,
                              mode
                            }: VehicleFormProps) {
  const {data: devicesPage} = useDevices();

  const form = useForm<CreateVehicle>({
    resolver: zodResolver(mode === 'create' ? CreateVehicleSchema : CreateVehicleSchema.partial()),
    defaultValues: {
      name: initialData?.name || '',
      plate: initialData?.plate || '',
      deviceId: initialData?.device?.id
    }
  });

  const handleSubmit = (data: CreateVehicle) => {
    if (mode === 'create' && onSubmit) {
      onSubmit(data);
    } else if (mode === 'edit' && onUpdate) {
      const updateData: Partial<Vehicle> = {
        name: data.name,
        plate: data.plate,
        device: {id: data.deviceId}
      };
      onUpdate(updateData);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({field}) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input
                  placeholder="Caminhão de insumos"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                O tamanho do nome deve estar entre 2 e 32 caracteres
              </FormDescription>
              <FormMessage/>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="plate"
          render={({field}) => (
            <FormItem>
              <FormLabel>Placa</FormLabel>
              <FormControl>
                <Input
                  placeholder="ABC1234"
                  {...field}
                  disabled={isLoading}
                  className="uppercase"
                />
              </FormControl>
              <FormDescription>
                A placa deve estar no formato ABC1234
              </FormDescription>
              <FormMessage/>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deviceId"
          render={({field}) => (
            <FormItem>
              <FormLabel>Dispositivo atribuído</FormLabel>
              <Select
                disabled={isLoading}
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um dispositivo"/>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {devicesPage?.content.map((device) => (
                    <SelectItem
                      key={device.id}
                      value={device.id?.toString() || ''}
                    >
                      {device.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Selecione o dispositivo para atribuir ao veículo
              </FormDescription>
              <FormMessage/>
            </FormItem>
          )}
        />

        <div className="flex justify-between items-center">
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading
              ? mode === 'create' ? 'Criando...' : 'Atualizando...'
              : mode === 'create' ? 'Criar' : 'Atualizar'
            }
          </Button>

          {mode === 'edit' && onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isLoading}>
                  Deletar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o
                    veículo e remover seus dados do sistema.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Deletar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </form>
    </Form>
  );
}
