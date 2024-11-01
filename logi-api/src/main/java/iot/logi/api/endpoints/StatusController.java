package iot.logi.api.endpoints;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/status")
public class StatusController {

    private static final Logger log = LoggerFactory.getLogger(StatusController.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Value("${spring.application.version}")
    private String version;

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<StatusResponse> getStatus() {

        boolean hasError = false;
        StatusVersion databaseStatus;
        try {
            var databaseVersion = jdbcTemplate.queryForObject("SHOW server_version;", String.class);
            databaseStatus = new StatusVersion("OK", databaseVersion);
        } catch (Exception e) {
            databaseStatus = new StatusVersion("ERROR", null);
            log.error("Error getting database version", e);
            hasError = true;
        }

        StatusVersion messageBrokerStatus;
        try {
            var messageBrokerVersion = rabbitTemplate.execute(channel ->
                    channel.getConnection().getServerProperties().get("version").toString());
            messageBrokerStatus = new StatusVersion("OK", messageBrokerVersion);
        } catch (Exception e) {
            messageBrokerStatus = new StatusVersion("ERROR", null);
            log.error("Error getting message broker version", e);
            hasError = true;
        }
        var commitHash = System.getenv("COMMIT_HASH") == null ?
                "local-version" : System.getenv("COMMIT_HASH");

        var status = new StatusResponse(
                !hasError ? "OK" : "WARNING", databaseStatus, messageBrokerStatus, commitHash, version);

        return ResponseEntity.ok(status);
    }
}

record StatusResponse(String status, StatusVersion database, StatusVersion messageBroker, String commitHash, String apiVersion) {}
record StatusVersion(String status, String version) {}
