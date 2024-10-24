package iot.logi.api.endpoints;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/status")
public class Status {

    @GetMapping
    public String getStatus() {
        String hostname = System.getenv().getOrDefault("HOSTNAME", "unknown");
        return "OK from " + hostname;
    }

}
