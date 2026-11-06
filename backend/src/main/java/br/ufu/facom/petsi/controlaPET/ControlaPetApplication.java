package br.ufu.facom.petsi.controlaPET;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ControlaPetApplication {

	public static void main(String[] args) {
		SpringApplication.run(ControlaPetApplication.class, args);
	}

}
