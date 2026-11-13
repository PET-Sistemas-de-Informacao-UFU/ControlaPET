package br.ufu.facom.petsi.controlaPET.model;

import br.ufu.facom.petsi.controlaPET.model.enums.DefectReportStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "defect_reports", indexes = {
    @Index(name = "idx_defect_report_item", columnList = "item_id"),
    @Index(name = "idx_defect_report_loan_status", columnList = "loan_id,status"),
    @Index(name = "idx_defect_report_status_created", columnList = "status,created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DefectReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reported_by_id", nullable = false)
    private User reportedBy;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DefectReportStatus status;

    // Null for reports created before quantity tracking was introduced.
    private Integer quantity;

    private Integer confirmedQuantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_id")
    private Loan loan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "confirmed_by_id")
    private User confirmedBy;

    private LocalDateTime confirmedAt;
    private LocalDateTime maintenanceStartedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "closed_by_id")
    private User closedBy;

    private LocalDateTime closedAt;

    @Column(columnDefinition = "TEXT")
    private String resolutionNotes;
}
