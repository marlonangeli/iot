package iot.logi.api.services;

import iot.logi.api.dtos.LocationDto;
import iot.logi.api.models.Location;
import iot.logi.api.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LocationService {
    private final LocationRepository locationRepository;

    @Autowired
    public LocationService(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    @Transactional
    public Location createLocation(LocationDto locationDto) {
        validateUniqueLocation(locationDto);

        Location location = new Location();
        location.setName(locationDto.getName());
        location.setLatitude(locationDto.getLatitude());
        location.setLongitude(locationDto.getLongitude());
        location.setType(locationDto.getType());

        try {
            return locationRepository.save(location);
        } catch (Exception e) {
            throw new IllegalArgumentException("Erro ao salvar localização: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Location findLocationById(Long id) {
        return locationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Localização não encontrada com ID: " + id));
    }

    @Transactional(readOnly = true)
    public Page<Location> findAllLocations(Pageable pageable) {
        return locationRepository.findAll(pageable);
    }

    @Transactional
    public Location updateLocation(Long id, LocationDto locationDto) {
        Location location = findLocationById(id);
        location.setName(locationDto.getName());
        location.setLatitude(locationDto.getLatitude());
        location.setLongitude(locationDto.getLongitude());
        location.setType(locationDto.getType());

        try {
            return locationRepository.save(location);
        } catch (Exception e) {
            throw new IllegalArgumentException("Erro ao atualizar localização: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteLocation(Long id) {
        Location location = findLocationById(id);

        try {
            locationRepository.delete(location);
        } catch (Exception e) {
            throw new IllegalArgumentException("Erro ao deletar localização: " + e.getMessage());
        }
    }

    private void validateUniqueLocation(LocationDto locationDto) {
        boolean locationExists = locationRepository.existsByNearbyCoordinates(
                locationDto.getLatitude(),
                locationDto.getLongitude(),
                0.01 // tolerância de 0.01 graus (aproximadamente 1.1 km)
        );

        if (locationExists) {
            throw new IllegalArgumentException("Já existe uma localização muito próxima a estas coordenadas");
        }
    }
}
