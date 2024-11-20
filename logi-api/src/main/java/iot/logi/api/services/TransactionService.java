package iot.logi.api.services;

import iot.logi.api.dtos.TransactionDto;
import iot.logi.api.exceptions.SaveEntityException;
import iot.logi.api.exceptions.ValidationException;
import iot.logi.api.models.Driver;
import iot.logi.api.models.Location;
import iot.logi.api.models.Transaction;
import iot.logi.api.models.Vehicle;
import iot.logi.api.repository.DriverRepository;
import iot.logi.api.repository.LocationRepository;
import iot.logi.api.repository.TransactionRepository;
import iot.logi.api.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final LocationRepository locationRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;

    @Autowired
    public TransactionService(TransactionRepository transactionRepository, LocationRepository locationRepository, DriverRepository driverRepository, VehicleRepository vehicleRepository) {
        this.transactionRepository = transactionRepository;
        this.locationRepository = locationRepository;
        this.driverRepository = driverRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @Transactional
    public Transaction createTransaction(TransactionDto transactionDto) {
        Location originLocation = findLocationById(transactionDto.getOriginLocationId());
        Location destinyLocation = findLocationById(transactionDto.getDestinyLocationId());
        Vehicle vehicle = findVehicleById(transactionDto.getVehicleId());
        Driver driver = findDriverById(transactionDto.getDriverId());

        if (transactionRepository.hasOngoingTransaction(vehicle.getId(), driver.getId())) {
            throw new ValidationException(
                    "Veículo ou motorista já está em uma transação em andamento"
            );
        }

        Transaction transaction = Transaction.builder()
                .originLocation(originLocation)
                .destinyLocation(destinyLocation)
                .vehicle(vehicle)
                .driver(driver)
                .dispatchTime(transactionDto.getDispatchTime())
                .arrivalTime(transactionDto.getArrivalTime())
                .cargoDescription(transactionDto.getCargoDescription())
                .build();

        try {
            return transactionRepository.save(transaction);
        } catch (Exception e) {
            throw new SaveEntityException("Erro ao salvar transação: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Transaction findTransactionById(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new ValidationException(
                        "Transação não encontrada com ID: " + id
                ));
    }

    @Transactional(readOnly = true)
    public Page<Transaction> findAllTransactions(Pageable pageable) {
        return transactionRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public double calculateDistanceBetweenLocations(Long transactionId) {
        Transaction transaction = findTransactionById(transactionId);
        Location originLocation = findLocationById(transaction.getOriginLocation().getId());
        Location destinyLocation = findLocationById(transaction.getDestinyLocation().getId());

        return calculateDistance(
                originLocation.getLatitude(), originLocation.getLongitude(),
                destinyLocation.getLatitude(), destinyLocation.getLongitude()
        );
    }

    @Transactional
    public Transaction updateTransaction(Long id, TransactionDto transactionDto) {
        Transaction existingTransaction = findTransactionById(id);

        Location originLocation = findLocationById(transactionDto.getOriginLocationId());
        Location destinyLocation = findLocationById(transactionDto.getDestinyLocationId());
        Vehicle vehicle = findVehicleById(transactionDto.getVehicleId());
        Driver driver = findDriverById(transactionDto.getDriverId());

        existingTransaction.setOriginLocation(originLocation);
        existingTransaction.setDestinyLocation(destinyLocation);
        existingTransaction.setVehicle(vehicle);
        existingTransaction.setDriver(driver);
        existingTransaction.setDispatchTime(transactionDto.getDispatchTime());
        existingTransaction.setArrivalTime(transactionDto.getArrivalTime());
        existingTransaction.setCargoDescription(transactionDto.getCargoDescription());

        try {
            return transactionRepository.save(existingTransaction);
        } catch (Exception e) {
            throw new SaveEntityException("Erro ao atualizar transação: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteTransaction(Long id) {
        Transaction transaction = findTransactionById(id);

        try {
            transactionRepository.delete(transaction);
        } catch (Exception e) {
            throw new SaveEntityException("Erro ao deletar transação: " + e.getMessage());
        }
    }

    private Location findLocationById(Long id) {
        return locationRepository.findById(id)
                .orElseThrow(() -> new ValidationException(
                        "Local não encontrado com ID: " + id
                ));
    }

    private Vehicle findVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ValidationException(
                        "Veículo não encontrado com ID: " + id
                ));
    }

    private Driver findDriverById(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new ValidationException(
                        "Motorista não encontrado com ID: " + id
                ));
    }

    // Cálculo de distância (Haversine)
    private double calculateDistance(
            double lat1, double lon1,
            double lat2, double lon2
    ) {
        final int earth_ratio = 6371; // Raio da Terra em km

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return earth_ratio * c;
    }
}
