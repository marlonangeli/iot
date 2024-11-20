package iot.logi.api.services;

import iot.logi.api.dtos.DriverDto;
import iot.logi.api.exceptions.NotFoundException;
import iot.logi.api.exceptions.SaveEntityException;
import iot.logi.api.models.Driver;
import iot.logi.api.repository.DriverRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DriverService {

    private final DriverRepository driverRepository;

    @Autowired
    public DriverService(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    @Transactional
    public Driver createDriver(DriverDto driverDto) {
        Driver driver = iot.logi.api.models.Driver.builder()
                .name(driverDto.getName())
                .build();

        try {
            return driverRepository.save(driver);
        } catch (Exception e) {
            throw new SaveEntityException("Erro ao salvar motorista: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Driver findDriverById(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Motorista não encontrado com ID: " + id));
    }

    @Transactional(readOnly = true)
    public Page<Driver> findAllDrivers(Pageable pageable) {
        return driverRepository.findAll(pageable);
    }

    @Transactional
    public Driver updateDriver(Long id, DriverDto driverDto) {
        Driver driver = findDriverById(id);
        BeanUtils.copyProperties(driverDto, driver, "id");

        try {
            return driverRepository.save(driver);
        } catch (Exception e) {
            throw new SaveEntityException("Erro ao atualizar motorista: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteDriver(Long id) {
        Driver driver = findDriverById(id);

        try {
            driverRepository.delete(driver);
        } catch (Exception e) {
            throw new SaveEntityException("Erro ao deletar motorista: " + e.getMessage());
        }
    }

}
