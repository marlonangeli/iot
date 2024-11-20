package iot.logi.api.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "drivers")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "name", length = 64, nullable = false)
    public String name;

    @OneToMany(mappedBy = "driver", cascade = CascadeType.ALL)
    public List<Transaction> transactions;
}
