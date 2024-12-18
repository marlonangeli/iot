package iot.logi.api.services;

import iot.logi.api.dtos.VehicleDto;
import iot.logi.api.exceptions.SaveEntityException;
import iot.logi.api.models.Device;
import iot.logi.api.models.Vehicle;
import iot.logi.api.repository.DeviceRepository;
import iot.logi.api.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VehicleService {
    private final VehicleRepository vehicleRepository;
    private final DeviceRepository deviceRepository;

    @Autowired
    public VehicleService(VehicleRepository vehicleRepository, DeviceRepository deviceRepository) {
        this.vehicleRepository = vehicleRepository;
        this.deviceRepository = deviceRepository;
    }

    @Transactional
    public Vehicle createVehicle(VehicleDto vehicleDto) {
        Vehicle vehicle = Vehicle.builder()
                .name(vehicleDto.getName())
                .plate(vehicleDto.getPlate())
                .build();

        if (vehicleDto.getDeviceId() != null) {
            Device device = deviceRepository.findById(vehicleDto.getDeviceId())
                    .orElseThrow(() -> new IllegalArgumentException("Dispositivo não encontrado"));
            vehicle.setDevice(device);
        }

        try {
            return vehicleRepository.save(vehicle);
        } catch (Exception e) {
            throw new SaveEntityException("Erro ao salvar veículo: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Vehicle findVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Veículo não encontrado com ID: " + id));
    }

    @Transactional(readOnly = true)
    public Page<Vehicle> findAllVehicles(Pageable pageable) {
        return vehicleRepository.findAll(pageable);
    }

    @Transactional
    public Vehicle updateVehicle(Long id, Vehicle newVehicle) {
        Vehicle vehicle = findVehicleById(id);
        vehicle.setName(newVehicle.getName());
        vehicle.setPlate(newVehicle.getPlate());

        if (newVehicle.getDevice().getId() != null) {
            Device device = deviceRepository.findById(newVehicle.getDevice().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Dispositivo não encontrado"));
            vehicle.setDevice(device);
        }

        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public void deleteVehicle(Long id) {
        Vehicle vehicle = findVehicleById(id);

        try {
            vehicleRepository.delete(vehicle);
        } catch (Exception e) {
            throw new SaveEntityException("Erro ao deletar veículo: " + e.getMessage());
        }
    }
}
