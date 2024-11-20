package iot.logi.api.repository;

import iot.logi.api.models.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {

    @Query("""
                SELECT CASE WHEN COUNT(l) > 0 THEN true ELSE false END
                FROM Location l
                WHERE
                    ABS(l.latitude - :latitude) < :tolerance
                    AND ABS(l.longitude - :longitude) < :tolerance
            """)
    boolean existsByNearbyCoordinates(
            @Param("latitude") double latitude,
            @Param("longitude") double longitude,
            @Param("tolerance") double tolerance
    );

}
