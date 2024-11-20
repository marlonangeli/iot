package iot.logi.api.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", length = 32, nullable = false)
    private String name;

    @Column(name = "plate", length = 7, nullable = false)
    private String plate;

    @ManyToOne
    @JoinColumn(name = "device", nullable = false)
    private Device device;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL)
    private List<Transaction> transactions;
}
