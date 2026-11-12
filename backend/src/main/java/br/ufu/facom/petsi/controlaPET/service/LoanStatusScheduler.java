package br.ufu.facom.petsi.controlaPET.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;

@Slf4j
@Component
@RequiredArgsConstructor
public class LoanStatusScheduler {
    private static final String TIME_ZONE = "America/Sao_Paulo";
    private final LoanStatusService loanStatusService;

    @EventListener(ApplicationReadyEvent.class)
    public void updateOnStartup() {
        updateOverdueLoans();
    }

    @Scheduled(cron = "0 0 0 * * *", zone = TIME_ZONE)
    public void updateOverdueLoans() {
        int updated = loanStatusService.markOverdue(LocalDate.now(ZoneId.of(TIME_ZONE)));
        if (updated > 0) {
            log.info("Marked {} loans as overdue", updated);
        }
    }
}
