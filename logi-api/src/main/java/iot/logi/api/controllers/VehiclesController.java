package iot.logi.api.controllers;

import iot.logi.api.dtos.VehicleDto;
import iot.logi.api.models.Vehicle;
import iot.logi.api.services.VehicleService;
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
@RequestMapping("/vehicles")
public class VehiclesController {
    private final VehicleService vehicleService;

    @Autowired
    public VehiclesController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Vehicle create(@Valid @RequestBody VehicleDto vehicleDto) {
        return vehicleService.createVehicle(vehicleDto);
    }

    @GetMapping("/{id}")
    public Vehicle get(@PathVariable Long id) {
        return vehicleService.findVehicleById(id);
    }

    @GetMapping
    public ResponseEntity<Page<Vehicle>> getAll(
            @PageableDefault(page = 0, size = 10, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<Vehicle> vehicles = vehicleService.findAllVehicles(pageable);
        return ResponseEntity.ok(vehicles);
    }

    @PutMapping("/{id}")
    public Vehicle update(@PathVariable Long id, @Valid @RequestBody Vehicle vehicle) {
        return vehicleService.updateVehicle(id, vehicle);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
    }
}
