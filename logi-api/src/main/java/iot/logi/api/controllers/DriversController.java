package iot.logi.api.controllers;

import iot.logi.api.dtos.DriverDto;
import iot.logi.api.models.Driver;
import iot.logi.api.services.DriverService;
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
@RequestMapping("/drivers")
public class DriversController {
    private final DriverService driverService;

    @Autowired
    public DriversController(DriverService driverService) {
        this.driverService = driverService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Driver create(@Valid @RequestBody DriverDto driverDto) {
        return driverService.createDriver(driverDto);
    }

    @GetMapping("/{id}")
    public Driver get(@PathVariable Long id) {
        return driverService.findDriverById(id);
    }

    @GetMapping
    public ResponseEntity<Page<Driver>> getAll(
            @PageableDefault(page = 0, size = 10, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<Driver> drivers = driverService.findAllDrivers(pageable);
        return ResponseEntity.ok(drivers);
    }

    @PutMapping("/{id}")
    public Driver update(@PathVariable Long id, @Valid @RequestBody DriverDto driverDto) {
        return driverService.updateDriver(id, driverDto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        driverService.deleteDriver(id);
    }
}
