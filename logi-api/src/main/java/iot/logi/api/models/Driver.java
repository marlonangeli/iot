package iot.logi.api.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "drivers")
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "name", length = 64, nullable = false)
    public String name;

    @OneToMany(mappedBy = "driver", cascade = CascadeType.ALL)
    public List<Transaction> transactions;
}
