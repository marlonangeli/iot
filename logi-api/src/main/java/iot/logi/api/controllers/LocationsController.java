package iot.logi.api.controllers;

import iot.logi.api.dtos.LocationDto;
import iot.logi.api.models.Location;
import iot.logi.api.services.LocationService;
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
@RequestMapping("/locations")
public class LocationsController {

    private final LocationService locationService;

    @Autowired
    public LocationsController(LocationService locationService) {
        this.locationService = locationService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Location create(@Valid @RequestBody LocationDto locationDto) {
        return locationService.createLocation(locationDto);
    }

    @GetMapping("/{id}")
    public Location get(@PathVariable Long id) {
        return locationService.findLocationById(id);
    }

    @GetMapping
    public ResponseEntity<Page<Location>> getAll(
            @PageableDefault(page = 0, size = 10, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<Location> locations = locationService.findAllLocations(pageable);
        return ResponseEntity.ok(locations);
    }

    @PutMapping("/{id}")
    public Location update(@PathVariable Long id, @Valid @RequestBody LocationDto locationDto) {
        return locationService.updateLocation(id, locationDto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        locationService.deleteLocation(id);
    }
}
