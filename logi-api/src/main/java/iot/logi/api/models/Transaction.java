package iot.logi.api.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "origin_location", nullable = false)
    private Location originLocation;

    @ManyToOne
    @JoinColumn(name = "destiny_location", nullable = false)
    private Location destinyLocation;

    @ManyToOne
    @JoinColumn(name = "vehicle", nullable = false)
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "driver", nullable = false)
    private Driver driver;

    @Column(name = "dispatch_time", nullable = true)
    private LocalDateTime dispatchTime;

    @Column(name = "arrival_time", nullable = true)
    private LocalDateTime arrivalTime;

    @Column(name = "cargo_description", length = 80, nullable = true)
    private String cargoDescription;
}
