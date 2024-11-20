package iot.logi.api.services;

import iot.logi.api.dtos.DeviceDto;
import iot.logi.api.exceptions.NotFoundException;
import iot.logi.api.exceptions.SaveEntityException;
import iot.logi.api.models.Device;
import iot.logi.api.models.Location;
import iot.logi.api.repository.DeviceRepository;
import iot.logi.api.repository.LocationRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DeviceService {
    private final DeviceRepository deviceRepository;
    private final LocationRepository locationRepository;

    public DeviceService(DeviceRepository deviceRepository, LocationRepository locationRepository) {
        this.deviceRepository = deviceRepository;
        this.locationRepository = locationRepository;
    }

    @Transactional
    public Device createDevice(DeviceDto deviceDto) {
        Device device = Device.builder()
                .name(deviceDto.getName())
                .type(deviceDto.getType())
                .status(deviceDto.getStatus())
                .build();

        if (deviceDto.getLocationId() != null) {
            Location location = locationRepository.findById(deviceDto.getLocationId())
                    .orElseThrow(() -> new IllegalArgumentException("Localização não encontrada"));
            device.setLocation(location);
        }

        try {
            return deviceRepository.save(device);
        } catch (Exception e) {
            throw new SaveEntityException("Erro ao salvar dispositivo: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Device findDeviceById(Long id) {
        return deviceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Dispositivo não encontrado com ID: " + id));
    }

    @Transactional(readOnly = true)
    public Page<Device> findAllDevices(Pageable pageable) {
        return deviceRepository.findAll(pageable);
    }

    @Transactional
    public Device updateDevice(Long id, DeviceDto deviceDto) {
        Device existingDevice = findDeviceById(id);

        BeanUtils.copyProperties(deviceDto, existingDevice, "id");

        if (deviceDto.getLocationId() != null) {
            Location location = locationRepository.findById(deviceDto.getLocationId())
                    .orElseThrow(() -> new IllegalArgumentException("Localização não encontrada"));
            existingDevice.setLocation(location);
        }

        try {
            return deviceRepository.save(existingDevice);
        } catch (Exception e) {
            throw new SaveEntityException("Erro ao atualizar dispositivo: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteDevice(Long id) {
        Device device = findDeviceById(id);

        try {
            deviceRepository.delete(device);
        } catch (Exception e) {
            throw new SaveEntityException("Erro ao deletar dispositivo: " + e.getMessage());
        }
    }
}
