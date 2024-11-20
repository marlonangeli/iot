package iot.logi.api.controllers;

import iot.logi.api.dtos.DeviceDto;
import iot.logi.api.models.Device;
import iot.logi.api.services.DeviceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/devices")
public class DevicesController {
    private final DeviceService deviceService;

    @Autowired
    public DevicesController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Device create(@Valid @RequestBody DeviceDto deviceDto) {
        return deviceService.createDevice(deviceDto);
    }

    @GetMapping("/{id}")
    public Device get(@PathVariable Long id) {
        return deviceService.findDeviceById(id);
    }

    @GetMapping
    public ResponseEntity<Page<Device>> getAll(
            @PageableDefault(page = 0, size = 10, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<Device> devices = deviceService.findAllDevices(pageable);
        return ResponseEntity.ok(devices);
    }

    @PutMapping("/{id}")
    public Device update(@PathVariable Long id, @Valid @RequestBody DeviceDto deviceDto) {
        return deviceService.updateDevice(id, deviceDto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        deviceService.deleteDevice(id);
    }
}
