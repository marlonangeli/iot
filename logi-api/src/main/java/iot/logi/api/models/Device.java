package iot.logi.api.models;

import iot.logi.api.models.enums.DeviceStatus;
import iot.logi.api.models.enums.DeviceType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "devices")
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", length = 64, nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "location", nullable = true)
    private Location location;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private DeviceType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DeviceStatus status;

    @Column(name = "last_tracking", nullable = true)
    private LocalDateTime lastTracking;
}
